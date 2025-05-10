

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."accept_organization_invitation"("invitation_token" character varying) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  invitation_record public.organization_invitations%ROWTYPE;
BEGIN
  -- Get the invitation if it exists and is not expired
  SELECT * INTO invitation_record
  FROM public.organization_invitations
  WHERE token = invitation_token
  AND expires_at > now()
  AND accepted_at IS NULL;
  
  -- If no valid invitation found
  IF invitation_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Add the user to the organization
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    invited_by,
    invited_at
  )
  VALUES (
    invitation_record.organization_id,
    auth.uid(),
    invitation_record.role,
    invitation_record.invited_by,
    invitation_record.created_at
  );
  
  -- Update the invitation as accepted
  UPDATE public.organization_invitations
  SET 
    accepted_at = now(),
    accepted_by = auth.uid()
  WHERE id = invitation_record.id;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."accept_organization_invitation"("invitation_token" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."anonymize_click_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  anonymize BOOLEAN;
BEGIN
  -- Check org settings
  SELECT ip_anonymization INTO anonymize
  FROM public.organization_settings os
  JOIN public.links l ON l.organization_id = os.organization_id
  WHERE l.id = NEW.link_id;
  
  -- Anonymize IP if needed
  IF anonymize THEN
    NEW.ip_address := anonymize_ip(NEW.ip_address);
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."anonymize_click_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."anonymize_ip"("ip" character varying) RETURNS character varying
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  first_dot INT;
  second_dot INT;
  first_colon INT;
  second_colon INT;
  third_colon INT;
BEGIN
  -- For IPv4
  IF position('.' in ip) > 0 THEN
    first_dot := position('.' in ip);
    second_dot := position('.' in substring(ip from first_dot + 1));
    
    RETURN substring(ip from 1 for first_dot + second_dot) || '0.0';
  -- For IPv6
  ELSIF position(':' in ip) > 0 THEN
    first_colon := position(':' in ip);
    second_colon := position(':' in substring(ip from first_colon + 1));
    third_colon := position(':' in substring(ip from first_colon + second_colon + 1));
    
    RETURN substring(ip from 1 for first_colon + second_colon + third_colon) || ':0000:0000:0000:0000';
  ELSE
    RETURN NULL;
  END IF;
END;
$$;


ALTER FUNCTION "public"."anonymize_ip"("ip" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_old_clicks"("retention_days" integer DEFAULT 90) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
  partition_date DATE;
  partition_name TEXT;
  partitions_cursor CURSOR FOR
    SELECT tablename
    FROM pg_tables
    WHERE tablename LIKE 'clicks_y%'
    AND tablename ~ '^clicks_y[0-9]{4}m[0-9]{2}$'
    ORDER BY tablename;
BEGIN
  -- Loop through all partitions
  FOR partition_name IN partitions_cursor LOOP
    -- Extract date from partition name
    BEGIN
      partition_date := to_date(
        substring(partition_name FROM 'y([0-9]{4})m([0-9]{2})' FOR '#') || '-01',
        'YYYY-MM-DD'
      );
      
      -- If partition is older than retention period
      IF partition_date < (CURRENT_DATE - retention_days) THEN
        -- Archive data
        EXECUTE format('
          INSERT INTO public.clicks_archive
          SELECT *, now() as archived_at
          FROM public.%I',
          partition_name
        );
        
        -- Drop the partition
        EXECUTE format('DROP TABLE public.%I', partition_name);
        
        RAISE NOTICE 'Archived and dropped partition %', partition_name;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error processing partition %: %', partition_name, SQLERRM;
    END;
  END LOOP;
END;
$_$;


ALTER FUNCTION "public"."archive_old_clicks"("retention_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_click_fraud"("p_link_id" "uuid", "p_ip_address" character varying, "p_user_agent" "text", "p_referrer" "text", "p_country" character varying) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  fraud_score INTEGER := 0;
  fraud_reasons JSONB := '[]'::jsonb;
  org_id UUID;
  rule RECORD;
  recent_clicks INTEGER;
  suspicious BOOLEAN := false;
BEGIN
  -- Get organization ID for this link
  SELECT organization_id INTO org_id
  FROM public.links
  WHERE id = p_link_id;
  
  -- Check IP frequency (multiple clicks in short time)
  SELECT COUNT(*) INTO recent_clicks
  FROM public.clicks
  WHERE link_id = p_link_id
  AND ip_address = p_ip_address
  AND created_at > now() - interval '5 minutes';
  
  IF recent_clicks > 10 THEN
    fraud_score := fraud_score + 25;
    fraud_reasons := fraud_reasons || jsonb_build_object('reason', 'high_frequency', 'details', format('%s clicks in 5 minutes', recent_clicks));
    suspicious := true;
  END IF;
  
  -- Check empty user agent
  IF p_user_agent IS NULL OR p_user_agent = '' THEN
    fraud_score := fraud_score + 30;
    fraud_reasons := fraud_reasons || '{"reason": "empty_user_agent"}'::jsonb;
    suspicious := true;
  END IF;
  
  -- Check for known bot patterns
  IF p_user_agent ILIKE '%bot%' OR p_user_agent ILIKE '%crawl%' OR p_user_agent ILIKE '%spider%' THEN
    fraud_score := fraud_score + 40;
    fraud_reasons := fraud_reasons || jsonb_build_object('reason', 'bot_user_agent', 'details', p_user_agent);
    suspicious := true;
  END IF;
  
  -- Apply organization-specific rules if any
  FOR rule IN 
    SELECT * FROM public.fraud_rules 
    WHERE organization_id = org_id AND is_active = true
  LOOP
    -- Rule logic would go here
    -- This is simplified, would need to implement based on rule_type and rule_config
  END LOOP;
  
  RETURN jsonb_build_object(
    'score', fraud_score,
    'reasons', fraud_reasons,
    'suspicious', suspicious
  );
END;
$$;


ALTER FUNCTION "public"."check_click_fraud"("p_link_id" "uuid", "p_ip_address" character varying, "p_user_agent" "text", "p_referrer" "text", "p_country" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_clicks_partition"("year" integer, "month" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  partition_name TEXT := format('clicks_y%sm%s', year, LPAD(month::text, 2, '0'));
  start_date DATE := make_date(year, month, 1);
  end_date DATE := make_date(year, month, 1) + INTERVAL '1 month';
  sql TEXT;
BEGIN
  sql := format('
    CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.clicks
    FOR VALUES FROM (%L) TO (%L);',
    partition_name, start_date, end_date
  );
  
  EXECUTE sql;
  
  -- Add foreign key constraint
  sql := format('
    ALTER TABLE public.%I ADD CONSTRAINT fk_%I_link_id 
    FOREIGN KEY (link_id) REFERENCES public.links(id) ON DELETE CASCADE;',
    partition_name, partition_name
  );
  
  EXECUTE sql;
  
  RAISE NOTICE 'Created partition % for period % to %', partition_name, start_date, end_date;
END;
$$;


ALTER FUNCTION "public"."create_clicks_partition"("year" integer, "month" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_organization_on_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_org_id UUID;
  org_name TEXT;
  org_slug TEXT;
BEGIN
  -- Generate name and slug from email
  org_name := split_part(NEW.email, '@', 1) || '''s Organization';
  org_slug := 'org-' || replace(gen_random_uuid()::text, '-', '');
  
  -- Create the organization
  INSERT INTO public.organizations (
    name,
    slug,
    created_by
  )
  VALUES (
    org_name,
    org_slug,
    NEW.id
  )
  RETURNING id INTO new_org_id;
  
  -- Add the user as owner
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role
  )
  VALUES (
    new_org_id,
    NEW.id,
    'owner'
  );
  
  -- Initialize with free plan settings
  PERFORM initialize_organization_settings(new_org_id, 'free');
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_organization_on_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_future_partitions"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_month DATE := date_trunc('month', current_date);
  i INTEGER;
BEGIN
  FOR i IN 0..5 LOOP
    PERFORM create_clicks_partition(
      EXTRACT(YEAR FROM (current_month + (i || ' months')::interval))::INTEGER,
      EXTRACT(MONTH FROM (current_month + (i || ' months')::interval))::INTEGER
    );
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."create_future_partitions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_organization"("org_name" character varying, "org_slug" character varying, "plan_id" character varying DEFAULT 'free'::character varying) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Insert the new organization
  INSERT INTO public.organizations (name, slug, created_by)
  VALUES (org_name, org_slug, auth.uid())
  RETURNING id INTO new_org_id;
  
  -- Add the creator as an owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, auth.uid(), 'owner');
  
  -- Initialize organization settings based on plan
  PERFORM initialize_organization_settings(new_org_id, plan_id);
  
  RETURN new_org_id;
END;
$$;


ALTER FUNCTION "public"."create_organization"("org_name" character varying, "org_slug" character varying, "plan_id" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_base62_id"("length" integer DEFAULT 6) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * 62 + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."generate_base62_id"("length" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_profile_picture"("user_identifier" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  seed INTEGER;
  hue INTEGER;
  saturation INTEGER;
  lightness INTEGER;
  pattern_type INTEGER;
  colors TEXT[];
  bg_color TEXT;
  fg_color TEXT;
  svg TEXT;
  elements TEXT := '';
  i INTEGER;
  x INTEGER;
  y INTEGER;
  size INTEGER;
  grid_size INTEGER := 5;  -- 5x5 grid for simpler patterns
  cell_size INTEGER := 20; -- Size of each grid cell
  total_size INTEGER := grid_size * cell_size;
BEGIN
  -- Create a deterministic seed from the user identifier
  seed := ('x' || substr(md5(user_identifier), 1, 8))::bit(32)::integer;
  
  -- Set random seed for deterministic results
  PERFORM setseed(seed / 2147483647.0);
  
  -- Generate colors based on seed
  hue := (ABS(seed) % 360);  -- Hue between 0-359
  saturation := 65 + (ABS(seed / 1000) % 20);  -- Saturation between 65-85%
  lightness := 55 + (ABS(seed / 100000) % 15);  -- Lightness between 55-70%
  
  -- Format HSL colors
  bg_color := format('hsl(%s, %s%%, %s%%)', hue, saturation, lightness);
  fg_color := format('hsl(%s, %s%%, %s%%)', 
                   (hue + 180) % 360,  -- Complementary hue
                   saturation, 
                   (lightness + 25) % 101);  -- Adjusted lightness
  
  -- Choose a pattern type (0-7 different patterns)
  pattern_type := ABS(seed) % 8;
  
  -- Start SVG
  svg := format('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" width="100%%" height="100%%">
    <rect width="100%%" height="100%%" fill="%s" />',
    total_size, total_size, bg_color);
  
  -- Generate the pattern based on type
  CASE pattern_type
    WHEN 0 THEN  -- Symmetric triangles
      FOR y IN 0..grid_size-1 LOOP
        FOR x IN 0..grid_size-1 LOOP
          -- Only draw some triangles based on a deterministic pattern
          IF ((x * y + seed) % 3) = 0 THEN
            elements := elements || format(
              '<polygon points="%s,%s %s,%s %s,%s" fill="%s" />',
              x * cell_size, y * cell_size,
              (x+1) * cell_size, y * cell_size,
              x * cell_size, (y+1) * cell_size,
              fg_color
            );
          END IF;
        END LOOP;
      END LOOP;
      
    WHEN 1 THEN  -- Circles
      FOR y IN 0..grid_size-1 LOOP
        FOR x IN 0..grid_size-1 LOOP
          -- Only draw some circles based on a deterministic pattern
          IF ((x * 3 + y * 5 + seed) % 4) = 0 THEN
            elements := elements || format(
              '<circle cx="%s" cy="%s" r="%s" fill="%s" />',
              (x + 0.5) * cell_size,
              (y + 0.5) * cell_size,
              cell_size / 3,
              fg_color
            );
          END IF;
        END LOOP;
      END LOOP;
      
    WHEN 2 THEN  -- Squares
      FOR y IN 0..grid_size-1 LOOP
        FOR x IN 0..grid_size-1 LOOP
          -- Only draw some squares based on a deterministic pattern
          IF ((x * y + seed) % 3) = 0 THEN
            size := cell_size / 2;
            elements := elements || format(
              '<rect x="%s" y="%s" width="%s" height="%s" fill="%s" />',
              (x + 0.25) * cell_size,
              (y + 0.25) * cell_size,
              size, size,
              fg_color
            );
          END IF;
        END LOOP;
      END LOOP;
      
    WHEN 3 THEN  -- Half squares (diagonal pattern)
      FOR y IN 0..grid_size-1 LOOP
        FOR x IN 0..grid_size-1 LOOP
          -- Only draw some half squares based on a deterministic pattern
          IF ((x + y + seed) % 3) = 0 THEN
            elements := elements || format(
              '<polygon points="%s,%s %s,%s %s,%s" fill="%s" />',
              x * cell_size, y * cell_size,
              (x+1) * cell_size, (y+1) * cell_size,
              x * cell_size, (y+1) * cell_size,
              fg_color
            );
          END IF;
        END LOOP;
      END LOOP;
    
    WHEN 4 THEN  -- Diamond pattern
      FOR y IN 0..grid_size-1 LOOP
        FOR x IN 0..grid_size-1 LOOP
          IF ((x * 2 + y * 3 + seed) % 3) = 0 THEN
            elements := elements || format(
              '<polygon points="%s,%s %s,%s %s,%s %s,%s" fill="%s" />',
              (x + 0.5) * cell_size, y * cell_size,
              (x + 1) * cell_size, (y + 0.5) * cell_size,
              (x + 0.5) * cell_size, (y + 1) * cell_size,
              x * cell_size, (y + 0.5) * cell_size,
              fg_color
            );
          END IF;
        END LOOP;
      END LOOP;
      
    WHEN 5 THEN  -- Dots grid
      FOR y IN 0..grid_size-1 LOOP
        FOR x IN 0..grid_size-1 LOOP
          IF ((x * 7 + y * 11 + seed) % 4) < 2 THEN
            elements := elements || format(
              '<circle cx="%s" cy="%s" r="%s" fill="%s" />',
              (x + 0.5) * cell_size,
              (y + 0.5) * cell_size,
              cell_size / 4,
              fg_color
            );
          END IF;
        END LOOP;
      END LOOP;
      
    WHEN 6 THEN  -- Horizontal lines
      FOR y IN 0..grid_size-1 LOOP
        IF ((y + seed) % 3) = 0 THEN
          elements := elements || format(
            '<rect x="0" y="%s" width="%s" height="%s" fill="%s" />',
            (y + 0.35) * cell_size,
            total_size,
            cell_size * 0.3,
            fg_color
          );
        END IF;
      END LOOP;
      
    WHEN 7 THEN  -- Checkerboard that forms a shape
      FOR y IN 0..grid_size-1 LOOP
        FOR x IN 0..grid_size-1 LOOP
          -- Create a symmetric pattern based on distance from center
          IF (((x - grid_size/2)^2 + (y - grid_size/2)^2 + seed) % 3) = 0 THEN
            elements := elements || format(
              '<rect x="%s" y="%s" width="%s" height="%s" fill="%s" />',
              x * cell_size,
              y * cell_size,
              cell_size,
              cell_size,
              fg_color
            );
          END IF;
        END LOOP;
      END LOOP;
  END CASE;
  
  -- Close SVG
  svg := svg || elements || '</svg>';
  
  RETURN svg;
END;
$$;


ALTER FUNCTION "public"."generate_profile_picture"("user_identifier" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_user_profile_picture"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Generate an SVG profile picture based on user ID
  NEW.profile_picture_svg := generate_profile_picture(NEW.id::text);
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_user_profile_picture"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."initialize_organization_settings"("org_id" "uuid", "plan_id" character varying DEFAULT 'free'::character varying) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Insert default settings based on plan
  INSERT INTO public.organization_settings (
    organization_id,
    default_domain,
    branding_enabled,
    custom_branded_domains_enabled,
    max_team_members,
    max_links,
    analytics_retention_days,
    
    -- Feature flags based on plan
    enable_link_rotation,
    enable_password_protection,
    enable_scheduled_links,
    enable_custom_qr,
    qr_codes_limit,
    enable_custom_domains,
    enable_custom_slugs,
    enable_bio_pages,
    enable_pixels,
    enable_link_preview_customization,
    enable_campaigns,
    enable_fraud_detection,
    enable_extended_analytics
  )
  VALUES (
    org_id,
    CASE
      WHEN plan_id = 'free' THEN 'shortn.example.com'
      WHEN plan_id = 'pro' THEN 'go.example.com'
      WHEN plan_id = 'business' THEN 'link.example.com'
      ELSE 'shortn.example.com'
    END,
    CASE
      WHEN plan_id = 'free' THEN false
      ELSE true
    END,
    CASE
      WHEN plan_id IN ('pro', 'business') THEN true
      ELSE false
    END,
    CASE
      WHEN plan_id = 'free' THEN 1
      WHEN plan_id = 'pro' THEN 5
      WHEN plan_id = 'business' THEN 20
      ELSE 1
    END,
    CASE
      WHEN plan_id = 'free' THEN 100
      WHEN plan_id = 'pro' THEN 5000
      WHEN plan_id = 'business' THEN 50000
      ELSE 100
    END,
    CASE
      WHEN plan_id = 'free' THEN 30
      WHEN plan_id = 'pro' THEN 90
      WHEN plan_id = 'business' THEN 365
      ELSE 30
    END,
    
    -- Feature flags based on plan
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_link_rotation
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_password_protection
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_scheduled_links
    true, -- enable_custom_qr (free but limited)
    CASE
      WHEN plan_id = 'free' THEN 10
      WHEN plan_id = 'pro' THEN 100
      WHEN plan_id = 'business' THEN -1 -- unlimited
      ELSE 10
    END,
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_custom_domains
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_custom_slugs
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_bio_pages
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_pixels
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_link_preview_customization
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_campaigns
    CASE WHEN plan_id != 'free' THEN true ELSE false END, -- enable_fraud_detection
    CASE WHEN plan_id != 'free' THEN true ELSE false END  -- enable_extended_analytics
  );
  
  -- Create a subscription entry if not free plan
  IF plan_id != 'free' THEN
    INSERT INTO public.subscriptions (
      organization_id,
      plan_id,
      status,
      current_period_start,
      current_period_end
    )
    VALUES (
      org_id,
      plan_id,
      'active',
      now(),
      now() + interval '1 month'
    );
  END IF;
END;
$$;


ALTER FUNCTION "public"."initialize_organization_settings"("org_id" "uuid", "plan_id" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invalidate_link_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Increment cache version to invalidate Redis cache
  NEW.cache_version := COALESCE(OLD.cache_version, 0) + 1;
  
  -- Update cache metadata
  INSERT INTO public.cache_metadata (
    cache_key,
    data_type,
    entity_id,
    version,
    ttl,
    last_updated
  ) VALUES (
    'link:' || NEW.short_code,
    'link',
    NEW.id,
    NEW.cache_version,
    86400, -- 24 hours TTL
    now()
  ) ON CONFLICT (cache_key) DO UPDATE SET
    version = EXCLUDED.version,
    last_updated = now();
  
  -- Also invalidate user's links list cache
  INSERT INTO public.cache_metadata (
    cache_key,
    data_type,
    entity_id,
    version,
    ttl,
    last_updated
  ) VALUES (
    'user_links:' || NEW.user_id,
    'user_links',
    NEW.user_id,
    (SELECT COALESCE(MAX(version), 0) + 1 FROM public.cache_metadata WHERE cache_key = 'user_links:' || NEW.user_id),
    3600, -- 1 hour TTL
    now()
  ) ON CONFLICT (cache_key) DO UPDATE SET
    version = EXCLUDED.version,
    last_updated = now();
    
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."invalidate_link_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invalidate_organization_cache"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Determine organization ID
  IF TG_TABLE_NAME = 'organizations' THEN
    org_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'organization_members' THEN
    org_id := NEW.organization_id;
  ELSIF TG_TABLE_NAME = 'organization_settings' THEN
    org_id := NEW.organization_id;
  ELSIF TG_TABLE_NAME = 'links' AND NEW.organization_id IS NOT NULL THEN
    org_id := NEW.organization_id;
  END IF;
  
  -- If we have an org_id, update cache
  IF org_id IS NOT NULL THEN
    INSERT INTO public.cache_metadata (
      cache_key,
      data_type,
      entity_id,
      version,
      ttl,
      last_updated
    ) VALUES (
      'organization:' || org_id,
      'organization',
      org_id,
      (SELECT COALESCE(MAX(version), 0) + 1 FROM public.cache_metadata WHERE cache_key = 'organization:' || org_id),
      3600, -- 1 hour TTL
      now()
    ) ON CONFLICT (cache_key) DO UPDATE SET
      version = EXCLUDED.version,
      last_updated = now();
  END IF;
    
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."invalidate_organization_cache"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invite_to_organization"("org_id" "uuid", "user_email" character varying, "user_role" character varying DEFAULT 'member'::character varying) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  invitation_token VARCHAR(100);
  invitation_id UUID;
  current_member_count INTEGER;
  max_members INTEGER;
BEGIN
  -- Check if the current user has permission to invite
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'You do not have permission to invite users to this organization';
  END IF;
  
  -- Check if organization has reached member limit
  SELECT COUNT(*) INTO current_member_count
  FROM public.organization_members
  WHERE organization_id = org_id;
  
  SELECT max_team_members INTO max_members
  FROM public.organization_settings
  WHERE organization_id = org_id;
  
  IF current_member_count >= max_members THEN
    RAISE EXCEPTION 'Organization has reached maximum member limit. Upgrade your plan to add more members.';
  END IF;
  
  -- Generate a unique token
  invitation_token := encode(gen_random_bytes(32), 'hex');
  
  -- Create the invitation
  INSERT INTO public.organization_invitations (
    organization_id,
    email,
    role,
    invited_by,
    token,
    expires_at
  )
  VALUES (
    org_id,
    user_email,
    user_role,
    auth.uid(),
    invitation_token,
    now() + interval '7 days'
  )
  RETURNING id INTO invitation_id;
  
  RETURN invitation_id;
END;
$$;


ALTER FUNCTION "public"."invite_to_organization"("org_id" "uuid", "user_email" character varying, "user_role" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_link_active"("link_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  link_record public.links%ROWTYPE;
BEGIN
  SELECT * INTO link_record
  FROM public.links
  WHERE id = link_id;
  
  -- Check if link is active based on is_active flag
  IF NOT link_record.is_active THEN
    RETURN FALSE;
  END IF;
  
  -- Check schedule constraints
  IF (link_record.active_from IS NOT NULL AND now() < link_record.active_from) OR
     (link_record.active_until IS NOT NULL AND now() > link_record.active_until) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."is_link_active"("link_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."json_object_agg_merge"("jsonb_array" "jsonb"[]) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  result JSONB := '{}'::JSONB;
  json_obj JSONB;
  key TEXT;
  value INTEGER;
BEGIN
  -- Iterate through each JSON object in the array
  FOREACH json_obj IN ARRAY jsonb_array
  LOOP
    -- Iterate through each key-value pair in the JSON object
    FOR key, value IN SELECT * FROM jsonb_each_text(json_obj)
    LOOP
      -- If key already exists in result, add the values
      IF result ? key THEN
        result := jsonb_set(
          result,
          ARRAY[key],
          to_jsonb((result ->> key)::INTEGER + value)
        );
      -- Otherwise, add the key-value pair to result
      ELSE
        result := result || jsonb_build_object(key, value);
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."json_object_agg_merge"("jsonb_array" "jsonb"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_user_data_to_organization"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  user_plan VARCHAR(50);
BEGIN
  -- Process each user
  FOR user_record IN SELECT id, email FROM auth.users LOOP
    -- Determine user's current plan from subscriptions
    SELECT plan_id INTO user_plan
    FROM public.subscriptions
    WHERE organization_id IS NULL
    AND status = 'active'
    LIMIT 1;
    
    IF user_plan IS NULL THEN
      user_plan := 'free';
    END IF;
    
    -- Create an organization for the user
    INSERT INTO public.organizations (
      name, 
      slug, 
      created_by
    )
    VALUES (
      split_part(user_record.email, '@', 1) || '''s Organization',
      'org-' || replace(gen_random_uuid()::text, '-', ''),
      user_record.id
    )
    RETURNING id INTO new_org_id;
    
    -- Add user as organization owner
    INSERT INTO public.organization_members (
      organization_id,
      user_id,
      role
    )
    VALUES (
      new_org_id,
      user_record.id,
      'owner'
    );
    
    -- Initialize organization settings based on user's plan
    PERFORM initialize_organization_settings(new_org_id, user_plan);
    
    -- Update links
    UPDATE public.links
    SET organization_id = new_org_id
    WHERE user_id = user_record.id;
    
    -- Update tags
    UPDATE public.tags
    SET organization_id = new_org_id
    WHERE user_id = user_record.id;
    
    -- Update custom domains
    UPDATE public.custom_domains
    SET organization_id = new_org_id
    WHERE user_id = user_record.id;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."migrate_user_data_to_organization"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_click_with_fraud_check"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  fraud_check JSONB;
BEGIN
  -- Run fraud detection
  fraud_check := check_click_fraud(
    NEW.link_id,
    NEW.ip_address,
    NEW.user_agent,
    NEW.referrer,
    NEW.country
  );
  
  -- Update click with fraud info
  NEW.is_suspicious := (fraud_check->>'suspicious')::boolean;
  NEW.fraud_score := (fraud_check->>'score')::integer;
  NEW.fraud_reasons := fraud_check->'reasons';
  
  -- Update link click count only if not suspicious
  IF NOT NEW.is_suspicious THEN
    UPDATE public.links
    SET 
      click_count = click_count + 1,
      updated_at = now()
    WHERE id = NEW.link_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."record_click_with_fraud_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."regenerate_all_profile_pictures"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  user_rec RECORD;
BEGIN
  FOR user_rec IN SELECT id FROM auth.users LOOP
    UPDATE auth.users
    SET profile_picture_svg = generate_profile_picture(id::text)
    WHERE id = user_rec.id;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."regenerate_all_profile_pictures"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_link_password"("link_id" "uuid", "password" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if user has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.links l
    LEFT JOIN public.organization_members om ON l.organization_id = om.organization_id
    WHERE l.id = link_id
    AND (l.user_id = auth.uid() OR om.user_id = auth.uid())
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Set the password hash
  UPDATE public.links
  SET 
    is_password_protected = TRUE,
    password_hash = crypt(password, gen_salt('bf'))
  WHERE id = link_id;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."set_link_password"("link_id" "uuid", "password" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_daily_analytics"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Insert or update daily stats
  INSERT INTO public.analytics_daily (
    link_id, 
    date, 
    click_count,
    unique_visitors,
    countries,
    browsers,
    devices,
    referrers
  )
  WITH daily_stats AS (
    SELECT 
      link_id,
      date_trunc('day', created_at)::date AS click_date,
      COUNT(*) AS clicks,
      COUNT(DISTINCT ip_address) AS unique_ips,
      jsonb_object_agg(
        country, 
        country_count
      ) AS country_counts,
      jsonb_object_agg(
        browser, 
        browser_count
      ) AS browser_counts,
      jsonb_object_agg(
        device_type, 
        device_count
      ) AS device_counts,
      jsonb_object_agg(
        referrer, 
        referrer_count
      ) AS referrer_counts
    FROM (
      SELECT 
        link_id,
        created_at,
        ip_address,
        country,
        COUNT(*) OVER (PARTITION BY link_id, date_trunc('day', created_at), country) AS country_count,
        browser,
        COUNT(*) OVER (PARTITION BY link_id, date_trunc('day', created_at), browser) AS browser_count,
        device_type,
        COUNT(*) OVER (PARTITION BY link_id, date_trunc('day', created_at), device_type) AS device_count,
        referrer,
        COUNT(*) OVER (PARTITION BY link_id, date_trunc('day', created_at), referrer) AS referrer_count
      FROM public.clicks
      WHERE created_at >= date_trunc('day', now()) 
      AND created_at < date_trunc('day', now()) + interval '1 day'
    ) AS subquery
    GROUP BY link_id, click_date
  )
  SELECT 
    link_id,
    click_date,
    clicks,
    unique_ips,
    country_counts,
    browser_counts,
    device_counts,
    referrer_counts
  FROM daily_stats
  ON CONFLICT (link_id, date) DO UPDATE SET
    click_count = EXCLUDED.click_count,
    unique_visitors = EXCLUDED.unique_visitors,
    countries = EXCLUDED.countries,
    browsers = EXCLUDED.browsers,
    devices = EXCLUDED.devices,
    referrers = EXCLUDED.referrers,
    updated_at = now();
    
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_daily_analytics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_monthly_analytics"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_month DATE := date_trunc('month', current_date);
  month_start DATE := current_month;
  month_end DATE := (current_month + interval '1 month' - interval '1 day')::date;
  year_month TEXT := to_char(current_month, 'YYYY-MM');
BEGIN
  -- Insert or update monthly stats
  INSERT INTO public.analytics_monthly (
    link_id,
    year_month,
    start_date,
    end_date,
    click_count,
    unique_visitors,
    countries,
    browsers,
    devices,
    referrers
  )
  SELECT 
    link_id,
    year_month,
    month_start,
    month_end,
    SUM(click_count) AS click_count,
    SUM(unique_visitors) AS unique_visitors,
    json_object_agg_merge(countries) AS countries,
    json_object_agg_merge(browsers) AS browsers,
    json_object_agg_merge(devices) AS devices,
    json_object_agg_merge(referrers) AS referrers
  FROM 
    public.analytics_daily
  WHERE 
    date >= month_start AND date <= month_end
  GROUP BY 
    link_id, year_month, month_start, month_end
  ON CONFLICT (link_id, year_month) DO UPDATE SET
    click_count = EXCLUDED.click_count,
    unique_visitors = EXCLUDED.unique_visitors,
    countries = EXCLUDED.countries,
    browsers = EXCLUDED.browsers,
    devices = EXCLUDED.devices,
    referrers = EXCLUDED.referrers,
    updated_at = now();
END;
$$;


ALTER FUNCTION "public"."update_monthly_analytics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_organization_features"("org_id" "uuid", "plan_id" character varying) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.organization_settings
  SET
    enable_link_rotation = (plan_id != 'free'),
    enable_password_protection = (plan_id != 'free'),
    enable_scheduled_links = (plan_id != 'free'),
    enable_custom_qr = true,
    qr_codes_limit = CASE
      WHEN plan_id = 'free' THEN 10
      WHEN plan_id = 'pro' THEN 100
      WHEN plan_id = 'business' THEN -1 -- unlimited
      ELSE 10
    END,
    enable_custom_domains = (plan_id != 'free'),
    enable_custom_slugs = (plan_id != 'free'),
    enable_bio_pages = (plan_id != 'free'),
    enable_pixels = (plan_id != 'free'),
    enable_link_preview_customization = (plan_id != 'free'),
    enable_campaigns = (plan_id != 'free'),
    enable_fraud_detection = (plan_id != 'free'),
    enable_extended_analytics = (plan_id != 'free'),
    analytics_retention_days = CASE
      WHEN plan_id = 'free' THEN 30
      WHEN plan_id = 'pro' THEN 90
      WHEN plan_id = 'business' THEN 365
      ELSE 30
    END
  WHERE organization_id = org_id;
END;
$$;


ALTER FUNCTION "public"."update_organization_features"("org_id" "uuid", "plan_id" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_weekly_analytics"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_week DATE := date_trunc('week', current_date);
  week_start DATE := current_week;
  week_end DATE := current_week + interval '6 days';
  year_week TEXT := to_char(current_week, 'YYYY-WW');
BEGIN
  -- Insert or update weekly stats
  INSERT INTO public.analytics_weekly (
    link_id,
    year_week,
    start_date,
    end_date,
    click_count,
    unique_visitors,
    countries,
    browsers,
    devices,
    referrers
  )
  SELECT 
    link_id,
    year_week,
    week_start,
    week_end,
    SUM(click_count) AS click_count,
    SUM(unique_visitors) AS unique_visitors,
    json_object_agg_merge(countries) AS countries,
    json_object_agg_merge(browsers) AS browsers,
    json_object_agg_merge(devices) AS devices,
    json_object_agg_merge(referrers) AS referrers
  FROM 
    public.analytics_daily
  WHERE 
    date >= week_start AND date <= week_end
  GROUP BY 
    link_id, year_week, week_start, week_end
  ON CONFLICT (link_id, year_week) DO UPDATE SET
    click_count = EXCLUDED.click_count,
    unique_visitors = EXCLUDED.unique_visitors,
    countries = EXCLUDED.countries,
    browsers = EXCLUDED.browsers,
    devices = EXCLUDED.devices,
    referrers = EXCLUDED.referrers,
    updated_at = now();
END;
$$;


ALTER FUNCTION "public"."update_weekly_analytics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_link_password"("link_id" "uuid", "password" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  correct_password BOOLEAN;
BEGIN
  SELECT (password_hash = crypt(password, password_hash))
  INTO correct_password
  FROM public.links
  WHERE id = link_id
  AND is_password_protected = TRUE;
  
  IF correct_password THEN
    UPDATE public.links SET access_count = access_count + 1 WHERE id = link_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;


ALTER FUNCTION "public"."verify_link_password"("link_id" "uuid", "password" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analytics_daily" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "click_count" integer DEFAULT 0 NOT NULL,
    "unique_visitors" integer DEFAULT 0 NOT NULL,
    "countries" "jsonb" DEFAULT '{}'::"jsonb",
    "browsers" "jsonb" DEFAULT '{}'::"jsonb",
    "devices" "jsonb" DEFAULT '{}'::"jsonb",
    "referrers" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_daily" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_monthly" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "year_month" character varying(7) NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "click_count" integer DEFAULT 0 NOT NULL,
    "unique_visitors" integer DEFAULT 0 NOT NULL,
    "countries" "jsonb" DEFAULT '{}'::"jsonb",
    "browsers" "jsonb" DEFAULT '{}'::"jsonb",
    "devices" "jsonb" DEFAULT '{}'::"jsonb",
    "referrers" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_monthly" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_weekly" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "year_week" character varying(8) NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "click_count" integer DEFAULT 0 NOT NULL,
    "unique_visitors" integer DEFAULT 0 NOT NULL,
    "countries" "jsonb" DEFAULT '{}'::"jsonb",
    "browsers" "jsonb" DEFAULT '{}'::"jsonb",
    "devices" "jsonb" DEFAULT '{}'::"jsonb",
    "referrers" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_weekly" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bio_links" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "bio_page_id" "uuid" NOT NULL,
    "title" character varying(100) NOT NULL,
    "url" "text" NOT NULL,
    "icon" character varying(50),
    "color" character varying(7) DEFAULT '#000000'::character varying,
    "position" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "click_count" bigint DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bio_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bio_pages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "slug" character varying(50) NOT NULL,
    "title" character varying(100),
    "bio_text" "text",
    "profile_image_url" "text",
    "theme" character varying(50) DEFAULT 'default'::character varying,
    "custom_css" "text",
    "custom_js" "text",
    "is_published" boolean DEFAULT true,
    "custom_domain" "text",
    "meta_title" character varying(100),
    "meta_description" "text",
    "og_image_url" "text",
    "view_count" bigint DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bio_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bio_social_links" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "bio_page_id" "uuid" NOT NULL,
    "platform" character varying(50) NOT NULL,
    "username" character varying(100) NOT NULL,
    "display_text" character varying(100),
    "icon" character varying(50),
    "position" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bio_social_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cache_metadata" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "cache_key" character varying(255) NOT NULL,
    "data_type" character varying(50) NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "ttl" integer,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cache_metadata" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaign_links" (
    "campaign_id" "uuid" NOT NULL,
    "link_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."campaign_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "color" character varying(7) DEFAULT '#000000'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."links" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "original_url" "text" NOT NULL,
    "short_code" character varying(10) NOT NULL,
    "title" character varying(255),
    "description" "text",
    "is_active" boolean DEFAULT true,
    "click_count" bigint DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "cache_version" integer DEFAULT 1,
    "last_cached_at" timestamp with time zone,
    "is_password_protected" boolean DEFAULT false,
    "password_hash" character varying(255),
    "access_count" integer DEFAULT 0,
    "active_from" timestamp with time zone,
    "active_until" timestamp with time zone,
    "fallback_url" "text",
    CONSTRAINT "short_code_length" CHECK ((("length"(("short_code")::"text") >= 4) AND ("length"(("short_code")::"text") <= 10)))
);


ALTER TABLE "public"."links" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."campaign_metrics" AS
 SELECT "c"."id" AS "campaign_id",
    "c"."name" AS "campaign_name",
    "c"."organization_id",
    "count"(DISTINCT "cl"."link_id") AS "total_links",
    "sum"("l"."click_count") AS "total_clicks",
    "avg"("l"."click_count") AS "avg_clicks_per_link",
    "min"("l"."created_at") AS "first_link_created",
    "max"("l"."created_at") AS "last_link_created"
   FROM (("public"."campaigns" "c"
     JOIN "public"."campaign_links" "cl" ON (("c"."id" = "cl"."campaign_id")))
     JOIN "public"."links" "l" ON (("cl"."link_id" = "l"."id")))
  GROUP BY "c"."id", "c"."name", "c"."organization_id";


ALTER TABLE "public"."campaign_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clicks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "referrer" "text",
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_suspicious" boolean DEFAULT false,
    "fraud_score" integer DEFAULT 0,
    "fraud_reasons" "jsonb"
)
PARTITION BY RANGE ("created_at");


ALTER TABLE "public"."clicks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clicks_archive" (
    "id" "uuid",
    "link_id" "uuid" NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "referrer" "text",
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone,
    "is_suspicious" boolean,
    "fraud_score" integer,
    "fraud_reasons" "jsonb",
    "archived_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clicks_archive" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clicks_y2025m05" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "referrer" "text",
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_suspicious" boolean DEFAULT false,
    "fraud_score" integer DEFAULT 0,
    "fraud_reasons" "jsonb"
);


ALTER TABLE "public"."clicks_y2025m05" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clicks_y2025m06" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "referrer" "text",
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_suspicious" boolean DEFAULT false,
    "fraud_score" integer DEFAULT 0,
    "fraud_reasons" "jsonb"
);


ALTER TABLE "public"."clicks_y2025m06" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clicks_y2025m07" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "referrer" "text",
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_suspicious" boolean DEFAULT false,
    "fraud_score" integer DEFAULT 0,
    "fraud_reasons" "jsonb"
);


ALTER TABLE "public"."clicks_y2025m07" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clicks_y2025m08" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "referrer" "text",
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_suspicious" boolean DEFAULT false,
    "fraud_score" integer DEFAULT 0,
    "fraud_reasons" "jsonb"
);


ALTER TABLE "public"."clicks_y2025m08" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clicks_y2025m09" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "referrer" "text",
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_suspicious" boolean DEFAULT false,
    "fraud_score" integer DEFAULT 0,
    "fraud_reasons" "jsonb"
);


ALTER TABLE "public"."clicks_y2025m09" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clicks_y2025m10" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "ip_address" character varying(45),
    "user_agent" "text",
    "referrer" "text",
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_suspicious" boolean DEFAULT false,
    "fraud_score" integer DEFAULT 0,
    "fraud_reasons" "jsonb"
);


ALTER TABLE "public"."clicks_y2025m10" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_domains" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "domain" character varying(255) NOT NULL,
    "is_verified" boolean DEFAULT false,
    "verification_code" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "verified_at" timestamp with time zone
);


ALTER TABLE "public"."custom_domains" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fraud_rules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "rule_type" character varying(50) NOT NULL,
    "rule_config" "jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fraud_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."link_destinations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "destination_url" "text" NOT NULL,
    "weight" integer DEFAULT 100,
    "click_count" bigint DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."link_destinations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."link_metadata" (
    "link_id" "uuid" NOT NULL,
    "title" character varying(100),
    "description" "text",
    "image_url" "text",
    "site_name" character varying(100),
    "twitter_card" character varying(20) DEFAULT 'summary_large_image'::character varying,
    "twitter_site" character varying(50),
    "twitter_creator" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."link_metadata" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."link_pixels" (
    "link_id" "uuid" NOT NULL,
    "pixel_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."link_pixels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."link_rotation_rules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "destination_id" "uuid" NOT NULL,
    "rule_type" character varying(20) NOT NULL,
    "rule_value" "jsonb" NOT NULL,
    "priority" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."link_rotation_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."link_tags" (
    "link_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."link_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_invitations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "role" character varying(20) DEFAULT 'member'::character varying NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "token" character varying(100) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "accepted_at" timestamp with time zone,
    "accepted_by" "uuid"
);


ALTER TABLE "public"."organization_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(20) DEFAULT 'member'::character varying NOT NULL,
    "invited_by" "uuid",
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "slug" character varying(50) NOT NULL,
    "logo_url" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."organization_metrics" AS
 SELECT "o"."id" AS "organization_id",
    "o"."name" AS "organization_name",
    "count"(DISTINCT "om"."user_id") AS "total_members",
    "count"(DISTINCT "l"."id") AS "total_links",
    "sum"("l"."click_count") AS "total_clicks",
    "avg"("l"."click_count") AS "avg_clicks_per_link",
    "count"(DISTINCT "cd"."id") AS "total_custom_domains",
    "count"(DISTINCT "bp"."id") AS "total_bio_pages",
    "count"(DISTINCT "c"."id") AS "total_campaigns"
   FROM ((((("public"."organizations" "o"
     LEFT JOIN "public"."organization_members" "om" ON (("o"."id" = "om"."organization_id")))
     LEFT JOIN "public"."links" "l" ON (("o"."id" = "l"."organization_id")))
     LEFT JOIN "public"."custom_domains" "cd" ON (("o"."id" = "cd"."organization_id")))
     LEFT JOIN "public"."bio_pages" "bp" ON (("o"."id" = "bp"."organization_id")))
     LEFT JOIN "public"."campaigns" "c" ON (("o"."id" = "c"."organization_id")))
  GROUP BY "o"."id", "o"."name";


ALTER TABLE "public"."organization_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_settings" (
    "organization_id" "uuid" NOT NULL,
    "default_domain" character varying(255),
    "branding_enabled" boolean DEFAULT false,
    "custom_branded_domains_enabled" boolean DEFAULT false,
    "max_team_members" integer DEFAULT 1,
    "max_links" integer DEFAULT 100,
    "analytics_retention_days" integer DEFAULT 30,
    "gdpr_consent_required" boolean DEFAULT true,
    "collect_ip_addresses" boolean DEFAULT true,
    "ip_anonymization" boolean DEFAULT true,
    "max_data_retention_days" integer DEFAULT 90,
    "privacy_policy_url" "text",
    "enable_link_rotation" boolean DEFAULT false,
    "enable_password_protection" boolean DEFAULT false,
    "enable_scheduled_links" boolean DEFAULT false,
    "enable_custom_qr" boolean DEFAULT false,
    "qr_codes_limit" integer DEFAULT 10,
    "enable_custom_domains" boolean DEFAULT false,
    "enable_custom_slugs" boolean DEFAULT false,
    "enable_bio_pages" boolean DEFAULT false,
    "enable_pixels" boolean DEFAULT false,
    "enable_link_preview_customization" boolean DEFAULT false,
    "enable_campaigns" boolean DEFAULT false,
    "enable_fraud_detection" boolean DEFAULT false,
    "enable_extended_analytics" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pagination_metadata" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resource_type" character varying(50) NOT NULL,
    "cursor_key" character varying(255) NOT NULL,
    "next_cursor" character varying(100),
    "prev_cursor" character varying(100),
    "page_size" integer NOT NULL,
    "total_count" integer,
    "cache_version" integer DEFAULT 1 NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pagination_metadata" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pixels" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "platform" character varying(50) NOT NULL,
    "pixel_id" character varying(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pixels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."qr_codes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "link_id" "uuid" NOT NULL,
    "size" integer DEFAULT 300,
    "foreground_color" character varying(7) DEFAULT '#000000'::character varying,
    "background_color" character varying(7) DEFAULT '#FFFFFF'::character varying,
    "logo_url" "text",
    "correction_level" character varying(1) DEFAULT 'M'::character varying,
    "format" character varying(10) DEFAULT 'png'::character varying,
    "style" character varying(20) DEFAULT 'square'::character varying,
    "cached_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."qr_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "plan_id" character varying(50) NOT NULL,
    "status" character varying(20) NOT NULL,
    "current_period_start" timestamp with time zone NOT NULL,
    "current_period_end" timestamp with time zone NOT NULL,
    "cancel_at_period_end" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "payment_provider" character varying(20),
    "payment_provider_subscription_id" character varying(100)
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "name" character varying(50) NOT NULL,
    "color" character varying(7) DEFAULT '#000000'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_activity" AS
 SELECT "u"."id" AS "user_id",
    "u"."email",
    "count"(DISTINCT "l"."id") AS "total_links_created",
    "sum"("l"."click_count") AS "total_link_clicks",
    "count"(DISTINCT "om"."organization_id") AS "total_organizations",
    "max"("l"."created_at") AS "last_link_created",
    "max"("oi"."created_at") AS "last_invitation_sent"
   FROM ((("auth"."users" "u"
     LEFT JOIN "public"."links" "l" ON (("u"."id" = "l"."user_id")))
     LEFT JOIN "public"."organization_members" "om" ON (("u"."id" = "om"."user_id")))
     LEFT JOIN "public"."organization_invitations" "oi" ON (("u"."id" = "oi"."invited_by")))
  GROUP BY "u"."id", "u"."email";


ALTER TABLE "public"."user_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_consent" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "consent_type" character varying(50) NOT NULL,
    "consent_given" boolean NOT NULL,
    "consent_timestamp" timestamp with time zone DEFAULT "now"(),
    "ip_address" character varying(45),
    "consent_version" character varying(20),
    "consent_document_url" "text",
    "revoked_at" timestamp with time zone
);


ALTER TABLE "public"."user_consent" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "user_id" "uuid" NOT NULL,
    "default_domain" character varying(255),
    "custom_domains" "jsonb" DEFAULT '[]'::"jsonb",
    "analytics_enabled" boolean DEFAULT true,
    "theme" character varying(20) DEFAULT 'light'::character varying,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."clicks" ATTACH PARTITION "public"."clicks_y2025m05" FOR VALUES FROM ('2025-05-01 00:00:00+00') TO ('2025-06-01 00:00:00+00');



ALTER TABLE ONLY "public"."clicks" ATTACH PARTITION "public"."clicks_y2025m06" FOR VALUES FROM ('2025-06-01 00:00:00+00') TO ('2025-07-01 00:00:00+00');



ALTER TABLE ONLY "public"."clicks" ATTACH PARTITION "public"."clicks_y2025m07" FOR VALUES FROM ('2025-07-01 00:00:00+00') TO ('2025-08-01 00:00:00+00');



ALTER TABLE ONLY "public"."clicks" ATTACH PARTITION "public"."clicks_y2025m08" FOR VALUES FROM ('2025-08-01 00:00:00+00') TO ('2025-09-01 00:00:00+00');



ALTER TABLE ONLY "public"."clicks" ATTACH PARTITION "public"."clicks_y2025m09" FOR VALUES FROM ('2025-09-01 00:00:00+00') TO ('2025-10-01 00:00:00+00');



ALTER TABLE ONLY "public"."clicks" ATTACH PARTITION "public"."clicks_y2025m10" FOR VALUES FROM ('2025-10-01 00:00:00+00') TO ('2025-11-01 00:00:00+00');



ALTER TABLE ONLY "public"."analytics_daily"
    ADD CONSTRAINT "analytics_daily_link_id_date_key" UNIQUE ("link_id", "date");



ALTER TABLE ONLY "public"."analytics_daily"
    ADD CONSTRAINT "analytics_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_monthly"
    ADD CONSTRAINT "analytics_monthly_link_id_year_month_key" UNIQUE ("link_id", "year_month");



ALTER TABLE ONLY "public"."analytics_monthly"
    ADD CONSTRAINT "analytics_monthly_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_weekly"
    ADD CONSTRAINT "analytics_weekly_link_id_year_week_key" UNIQUE ("link_id", "year_week");



ALTER TABLE ONLY "public"."analytics_weekly"
    ADD CONSTRAINT "analytics_weekly_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bio_links"
    ADD CONSTRAINT "bio_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bio_pages"
    ADD CONSTRAINT "bio_pages_organization_id_slug_key" UNIQUE ("organization_id", "slug");



ALTER TABLE ONLY "public"."bio_pages"
    ADD CONSTRAINT "bio_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bio_pages"
    ADD CONSTRAINT "bio_pages_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."bio_social_links"
    ADD CONSTRAINT "bio_social_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cache_metadata"
    ADD CONSTRAINT "cache_metadata_cache_key_key" UNIQUE ("cache_key");



ALTER TABLE ONLY "public"."cache_metadata"
    ADD CONSTRAINT "cache_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_links"
    ADD CONSTRAINT "campaign_links_pkey" PRIMARY KEY ("campaign_id", "link_id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_organization_id_name_key" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clicks"
    ADD CONSTRAINT "clicks_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."clicks_y2025m05"
    ADD CONSTRAINT "clicks_y2025m05_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."clicks_y2025m06"
    ADD CONSTRAINT "clicks_y2025m06_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."clicks_y2025m07"
    ADD CONSTRAINT "clicks_y2025m07_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."clicks_y2025m08"
    ADD CONSTRAINT "clicks_y2025m08_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."clicks_y2025m09"
    ADD CONSTRAINT "clicks_y2025m09_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."clicks_y2025m10"
    ADD CONSTRAINT "clicks_y2025m10_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."custom_domains"
    ADD CONSTRAINT "custom_domains_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."custom_domains"
    ADD CONSTRAINT "custom_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fraud_rules"
    ADD CONSTRAINT "fraud_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."link_destinations"
    ADD CONSTRAINT "link_destinations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."link_metadata"
    ADD CONSTRAINT "link_metadata_pkey" PRIMARY KEY ("link_id");



ALTER TABLE ONLY "public"."link_pixels"
    ADD CONSTRAINT "link_pixels_pkey" PRIMARY KEY ("link_id", "pixel_id");



ALTER TABLE ONLY "public"."link_rotation_rules"
    ADD CONSTRAINT "link_rotation_rules_link_id_destination_id_rule_type_key" UNIQUE ("link_id", "destination_id", "rule_type");



ALTER TABLE ONLY "public"."link_rotation_rules"
    ADD CONSTRAINT "link_rotation_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."link_tags"
    ADD CONSTRAINT "link_tags_pkey" PRIMARY KEY ("link_id", "tag_id");



ALTER TABLE ONLY "public"."links"
    ADD CONSTRAINT "links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."links"
    ADD CONSTRAINT "links_short_code_key" UNIQUE ("short_code");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_organization_id_email_key" UNIQUE ("organization_id", "email");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("organization_id", "user_id");



ALTER TABLE ONLY "public"."organization_settings"
    ADD CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("organization_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."pagination_metadata"
    ADD CONSTRAINT "pagination_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pagination_metadata"
    ADD CONSTRAINT "pagination_metadata_user_id_resource_type_cursor_key_key" UNIQUE ("user_id", "resource_type", "cursor_key");



ALTER TABLE ONLY "public"."pixels"
    ADD CONSTRAINT "pixels_organization_id_name_key" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "public"."pixels"
    ADD CONSTRAINT "pixels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_link_id_key" UNIQUE ("link_id");



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_consent"
    ADD CONSTRAINT "user_consent_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_consent"
    ADD CONSTRAINT "user_consent_user_id_consent_type_key" UNIQUE ("user_id", "consent_type");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "idx_clicks_created_at" ON ONLY "public"."clicks" USING "btree" ("created_at" DESC);



CREATE INDEX "clicks_y2025m05_created_at_idx" ON "public"."clicks_y2025m05" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_clicks_link_id" ON ONLY "public"."clicks" USING "btree" ("link_id");



CREATE INDEX "clicks_y2025m05_link_id_idx" ON "public"."clicks_y2025m05" USING "btree" ("link_id");



CREATE INDEX "clicks_y2025m06_created_at_idx" ON "public"."clicks_y2025m06" USING "btree" ("created_at" DESC);



CREATE INDEX "clicks_y2025m06_link_id_idx" ON "public"."clicks_y2025m06" USING "btree" ("link_id");



CREATE INDEX "clicks_y2025m07_created_at_idx" ON "public"."clicks_y2025m07" USING "btree" ("created_at" DESC);



CREATE INDEX "clicks_y2025m07_link_id_idx" ON "public"."clicks_y2025m07" USING "btree" ("link_id");



CREATE INDEX "clicks_y2025m08_created_at_idx" ON "public"."clicks_y2025m08" USING "btree" ("created_at" DESC);



CREATE INDEX "clicks_y2025m08_link_id_idx" ON "public"."clicks_y2025m08" USING "btree" ("link_id");



CREATE INDEX "clicks_y2025m09_created_at_idx" ON "public"."clicks_y2025m09" USING "btree" ("created_at" DESC);



CREATE INDEX "clicks_y2025m09_link_id_idx" ON "public"."clicks_y2025m09" USING "btree" ("link_id");



CREATE INDEX "clicks_y2025m10_created_at_idx" ON "public"."clicks_y2025m10" USING "btree" ("created_at" DESC);



CREATE INDEX "clicks_y2025m10_link_id_idx" ON "public"."clicks_y2025m10" USING "btree" ("link_id");



CREATE INDEX "idx_analytics_daily_link_id_date" ON "public"."analytics_daily" USING "btree" ("link_id", "date");



CREATE INDEX "idx_analytics_monthly_link_id_year_month" ON "public"."analytics_monthly" USING "btree" ("link_id", "year_month");



CREATE INDEX "idx_analytics_weekly_link_id_year_week" ON "public"."analytics_weekly" USING "btree" ("link_id", "year_week");



CREATE INDEX "idx_bio_links_bio_page_id" ON "public"."bio_links" USING "btree" ("bio_page_id");



CREATE INDEX "idx_bio_pages_organization_id" ON "public"."bio_pages" USING "btree" ("organization_id");



CREATE INDEX "idx_bio_pages_slug" ON "public"."bio_pages" USING "btree" ("slug");



CREATE INDEX "idx_bio_pages_user_id" ON "public"."bio_pages" USING "btree" ("user_id");



CREATE INDEX "idx_bio_social_links_bio_page_id" ON "public"."bio_social_links" USING "btree" ("bio_page_id");



CREATE INDEX "idx_cache_metadata_data_type" ON "public"."cache_metadata" USING "btree" ("data_type");



CREATE INDEX "idx_cache_metadata_entity_id" ON "public"."cache_metadata" USING "btree" ("entity_id");



CREATE INDEX "idx_campaigns_organization_id" ON "public"."campaigns" USING "btree" ("organization_id");



CREATE INDEX "idx_custom_domains_organization_id" ON "public"."custom_domains" USING "btree" ("organization_id");



CREATE INDEX "idx_custom_domains_user_id" ON "public"."custom_domains" USING "btree" ("user_id");



CREATE INDEX "idx_fraud_rules_organization_id" ON "public"."fraud_rules" USING "btree" ("organization_id");



CREATE INDEX "idx_links_cache_version" ON "public"."links" USING "btree" ("cache_version");



CREATE INDEX "idx_links_created_at" ON "public"."links" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_links_organization_id" ON "public"."links" USING "btree" ("organization_id");



CREATE INDEX "idx_links_organization_id_created_at" ON "public"."links" USING "btree" ("organization_id", "created_at" DESC);



CREATE INDEX "idx_links_short_code" ON "public"."links" USING "btree" ("short_code");



CREATE INDEX "idx_links_user_id" ON "public"."links" USING "btree" ("user_id");



CREATE INDEX "idx_links_user_id_created_at" ON "public"."links" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_links_user_id_id" ON "public"."links" USING "btree" ("user_id", "id");



CREATE INDEX "idx_organization_invitations_email" ON "public"."organization_invitations" USING "btree" ("email");



CREATE INDEX "idx_organization_members_user_id" ON "public"."organization_members" USING "btree" ("user_id");



CREATE INDEX "idx_organizations_created_by" ON "public"."organizations" USING "btree" ("created_by");



CREATE INDEX "idx_pagination_metadata_user_resource" ON "public"."pagination_metadata" USING "btree" ("user_id", "resource_type");



CREATE INDEX "idx_pixels_organization_id" ON "public"."pixels" USING "btree" ("organization_id");



CREATE INDEX "idx_tags_organization_id" ON "public"."tags" USING "btree" ("organization_id");



CREATE INDEX "idx_tags_user_id" ON "public"."tags" USING "btree" ("user_id");



CREATE INDEX "idx_user_consent_user_id" ON "public"."user_consent" USING "btree" ("user_id");



ALTER INDEX "public"."idx_clicks_created_at" ATTACH PARTITION "public"."clicks_y2025m05_created_at_idx";



ALTER INDEX "public"."idx_clicks_link_id" ATTACH PARTITION "public"."clicks_y2025m05_link_id_idx";



ALTER INDEX "public"."clicks_pkey" ATTACH PARTITION "public"."clicks_y2025m05_pkey";



ALTER INDEX "public"."idx_clicks_created_at" ATTACH PARTITION "public"."clicks_y2025m06_created_at_idx";



ALTER INDEX "public"."idx_clicks_link_id" ATTACH PARTITION "public"."clicks_y2025m06_link_id_idx";



ALTER INDEX "public"."clicks_pkey" ATTACH PARTITION "public"."clicks_y2025m06_pkey";



ALTER INDEX "public"."idx_clicks_created_at" ATTACH PARTITION "public"."clicks_y2025m07_created_at_idx";



ALTER INDEX "public"."idx_clicks_link_id" ATTACH PARTITION "public"."clicks_y2025m07_link_id_idx";



ALTER INDEX "public"."clicks_pkey" ATTACH PARTITION "public"."clicks_y2025m07_pkey";



ALTER INDEX "public"."idx_clicks_created_at" ATTACH PARTITION "public"."clicks_y2025m08_created_at_idx";



ALTER INDEX "public"."idx_clicks_link_id" ATTACH PARTITION "public"."clicks_y2025m08_link_id_idx";



ALTER INDEX "public"."clicks_pkey" ATTACH PARTITION "public"."clicks_y2025m08_pkey";



ALTER INDEX "public"."idx_clicks_created_at" ATTACH PARTITION "public"."clicks_y2025m09_created_at_idx";



ALTER INDEX "public"."idx_clicks_link_id" ATTACH PARTITION "public"."clicks_y2025m09_link_id_idx";



ALTER INDEX "public"."clicks_pkey" ATTACH PARTITION "public"."clicks_y2025m09_pkey";



ALTER INDEX "public"."idx_clicks_created_at" ATTACH PARTITION "public"."clicks_y2025m10_created_at_idx";



ALTER INDEX "public"."idx_clicks_link_id" ATTACH PARTITION "public"."clicks_y2025m10_link_id_idx";



ALTER INDEX "public"."clicks_pkey" ATTACH PARTITION "public"."clicks_y2025m10_pkey";



CREATE OR REPLACE TRIGGER "anonymize_clicks_before_insert" BEFORE INSERT ON "public"."clicks" FOR EACH ROW EXECUTE FUNCTION "public"."anonymize_click_data"();



CREATE OR REPLACE TRIGGER "check_fraud_before_insert" BEFORE INSERT ON "public"."clicks" FOR EACH ROW EXECUTE FUNCTION "public"."record_click_with_fraud_check"();



CREATE OR REPLACE TRIGGER "invalidate_link_cache_trigger" BEFORE UPDATE ON "public"."links" FOR EACH ROW EXECUTE FUNCTION "public"."invalidate_link_cache"();



CREATE OR REPLACE TRIGGER "invalidate_organization_cache_trigger" AFTER INSERT OR UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."invalidate_organization_cache"();



CREATE OR REPLACE TRIGGER "invalidate_organization_members_cache_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."organization_members" FOR EACH ROW EXECUTE FUNCTION "public"."invalidate_organization_cache"();



CREATE OR REPLACE TRIGGER "update_analytics_daily_updated_at" BEFORE UPDATE ON "public"."analytics_daily" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_analytics_monthly_updated_at" BEFORE UPDATE ON "public"."analytics_monthly" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_analytics_weekly_updated_at" BEFORE UPDATE ON "public"."analytics_weekly" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_bio_links_updated_at" BEFORE UPDATE ON "public"."bio_links" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_bio_pages_updated_at" BEFORE UPDATE ON "public"."bio_pages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_campaigns_updated_at" BEFORE UPDATE ON "public"."campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_daily_analytics_trigger" AFTER INSERT ON "public"."clicks" REFERENCING NEW TABLE AS "inserted" FOR EACH STATEMENT EXECUTE FUNCTION "public"."update_daily_analytics"();



CREATE OR REPLACE TRIGGER "update_fraud_rules_updated_at" BEFORE UPDATE ON "public"."fraud_rules" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_link_metadata_updated_at" BEFORE UPDATE ON "public"."link_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_links_updated_at" BEFORE UPDATE ON "public"."links" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organization_settings_updated_at" BEFORE UPDATE ON "public"."organization_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_pixels_updated_at" BEFORE UPDATE ON "public"."pixels" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_qr_codes_updated_at" BEFORE UPDATE ON "public"."qr_codes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."analytics_daily"
    ADD CONSTRAINT "analytics_daily_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_monthly"
    ADD CONSTRAINT "analytics_monthly_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_weekly"
    ADD CONSTRAINT "analytics_weekly_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bio_links"
    ADD CONSTRAINT "bio_links_bio_page_id_fkey" FOREIGN KEY ("bio_page_id") REFERENCES "public"."bio_pages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bio_pages"
    ADD CONSTRAINT "bio_pages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bio_pages"
    ADD CONSTRAINT "bio_pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bio_social_links"
    ADD CONSTRAINT "bio_social_links_bio_page_id_fkey" FOREIGN KEY ("bio_page_id") REFERENCES "public"."bio_pages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_links"
    ADD CONSTRAINT "campaign_links_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_links"
    ADD CONSTRAINT "campaign_links_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_domains"
    ADD CONSTRAINT "custom_domains_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_domains"
    ADD CONSTRAINT "custom_domains_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clicks_y2025m05"
    ADD CONSTRAINT "fk_clicks_y2025m05_link_id" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clicks_y2025m06"
    ADD CONSTRAINT "fk_clicks_y2025m06_link_id" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clicks_y2025m07"
    ADD CONSTRAINT "fk_clicks_y2025m07_link_id" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clicks_y2025m08"
    ADD CONSTRAINT "fk_clicks_y2025m08_link_id" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clicks_y2025m09"
    ADD CONSTRAINT "fk_clicks_y2025m09_link_id" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clicks_y2025m10"
    ADD CONSTRAINT "fk_clicks_y2025m10_link_id" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fraud_rules"
    ADD CONSTRAINT "fraud_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."link_destinations"
    ADD CONSTRAINT "link_destinations_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."link_metadata"
    ADD CONSTRAINT "link_metadata_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."link_pixels"
    ADD CONSTRAINT "link_pixels_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."link_pixels"
    ADD CONSTRAINT "link_pixels_pixel_id_fkey" FOREIGN KEY ("pixel_id") REFERENCES "public"."pixels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."link_rotation_rules"
    ADD CONSTRAINT "link_rotation_rules_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "public"."link_destinations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."link_rotation_rules"
    ADD CONSTRAINT "link_rotation_rules_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."link_tags"
    ADD CONSTRAINT "link_tags_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."link_tags"
    ADD CONSTRAINT "link_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."links"
    ADD CONSTRAINT "links_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."links"
    ADD CONSTRAINT "links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_settings"
    ADD CONSTRAINT "organization_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."pagination_metadata"
    ADD CONSTRAINT "pagination_metadata_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pixels"
    ADD CONSTRAINT "pixels_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."qr_codes"
    ADD CONSTRAINT "qr_codes_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_consent"
    ADD CONSTRAINT "user_consent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "admin_all_access" ON "public"."links" USING ((EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



ALTER TABLE "public"."analytics_daily" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_monthly" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_weekly" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bio_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bio_pages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bio_social_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cache_metadata" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaign_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clicks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fraud_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."link_destinations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."link_metadata" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."link_pixels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."link_rotation_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."link_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."links" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "links_delete_policy" ON "public"."links" FOR DELETE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "links"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND (("organization_members"."role")::"text" = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::"text"[])))))));



CREATE POLICY "links_insert_policy" ON "public"."links" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND (("organization_id" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "organization_members"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "links_select_policy" ON "public"."links" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "links"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"())))) OR ("is_active" = true)));



CREATE POLICY "links_update_policy" ON "public"."links" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "links"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."organization_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organization_members_delete_policy" ON "public"."organization_members" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."organization_members" "organization_members_1"
  WHERE (("organization_members_1"."organization_id" = "organization_members_1"."organization_id") AND ("organization_members_1"."user_id" = "auth"."uid"()) AND (("organization_members_1"."role")::"text" = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::"text"[]))))) OR (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true))))));



CREATE POLICY "organization_members_insert_policy" ON "public"."organization_members" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."organization_members" "organization_members_1"
  WHERE (("organization_members_1"."organization_id" = "organization_members_1"."organization_id") AND ("organization_members_1"."user_id" = "auth"."uid"()) AND (("organization_members_1"."role")::"text" = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::"text"[]))))) OR (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true))))));



CREATE POLICY "organization_members_select_policy" ON "public"."organization_members" FOR SELECT USING ((("organization_id" IN ( SELECT "organization_members_1"."organization_id"
   FROM "public"."organization_members" "organization_members_1"
  WHERE ("organization_members_1"."user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true))))));



CREATE POLICY "organization_members_update_policy" ON "public"."organization_members" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."organization_members" "organization_members_1"
  WHERE (("organization_members_1"."organization_id" = "organization_members_1"."organization_id") AND ("organization_members_1"."user_id" = "auth"."uid"()) AND (("organization_members_1"."role")::"text" = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::"text"[]))))) OR (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true))))));



ALTER TABLE "public"."organization_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizations_delete_policy" ON "public"."organizations" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "organizations"."id") AND ("organization_members"."user_id" = "auth"."uid"()) AND (("organization_members"."role")::"text" = 'owner'::"text")))) OR (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true))))));



CREATE POLICY "organizations_insert_policy" ON "public"."organizations" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "organizations_select_policy" ON "public"."organizations" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "organizations"."id") AND ("organization_members"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true))))));



CREATE POLICY "organizations_update_policy" ON "public"."organizations" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "organizations"."id") AND ("organization_members"."user_id" = "auth"."uid"()) AND (("organization_members"."role")::"text" = ANY ((ARRAY['owner'::character varying, 'admin'::character varying])::"text"[]))))) OR (EXISTS ( SELECT 1
   FROM "auth"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true))))));



ALTER TABLE "public"."pagination_metadata" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pixels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."qr_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_consent" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
































































































































































































GRANT ALL ON FUNCTION "public"."accept_organization_invitation"("invitation_token" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."accept_organization_invitation"("invitation_token" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_organization_invitation"("invitation_token" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."anonymize_click_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."anonymize_click_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."anonymize_click_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."anonymize_ip"("ip" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."anonymize_ip"("ip" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."anonymize_ip"("ip" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_old_clicks"("retention_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."archive_old_clicks"("retention_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_old_clicks"("retention_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_click_fraud"("p_link_id" "uuid", "p_ip_address" character varying, "p_user_agent" "text", "p_referrer" "text", "p_country" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."check_click_fraud"("p_link_id" "uuid", "p_ip_address" character varying, "p_user_agent" "text", "p_referrer" "text", "p_country" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_click_fraud"("p_link_id" "uuid", "p_ip_address" character varying, "p_user_agent" "text", "p_referrer" "text", "p_country" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_clicks_partition"("year" integer, "month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_clicks_partition"("year" integer, "month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_clicks_partition"("year" integer, "month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_organization_on_signup"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_organization_on_signup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_organization_on_signup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_future_partitions"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_future_partitions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_future_partitions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_organization"("org_name" character varying, "org_slug" character varying, "plan_id" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."create_organization"("org_name" character varying, "org_slug" character varying, "plan_id" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_organization"("org_name" character varying, "org_slug" character varying, "plan_id" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_base62_id"("length" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_base62_id"("length" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_base62_id"("length" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_profile_picture"("user_identifier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_profile_picture"("user_identifier" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_profile_picture"("user_identifier" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_user_profile_picture"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_user_profile_picture"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_user_profile_picture"() TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_organization_settings"("org_id" "uuid", "plan_id" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_organization_settings"("org_id" "uuid", "plan_id" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_organization_settings"("org_id" "uuid", "plan_id" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."invalidate_link_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."invalidate_link_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."invalidate_link_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."invalidate_organization_cache"() TO "anon";
GRANT ALL ON FUNCTION "public"."invalidate_organization_cache"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."invalidate_organization_cache"() TO "service_role";



GRANT ALL ON FUNCTION "public"."invite_to_organization"("org_id" "uuid", "user_email" character varying, "user_role" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."invite_to_organization"("org_id" "uuid", "user_email" character varying, "user_role" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."invite_to_organization"("org_id" "uuid", "user_email" character varying, "user_role" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_link_active"("link_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_link_active"("link_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_link_active"("link_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."json_object_agg_merge"("jsonb_array" "jsonb"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."json_object_agg_merge"("jsonb_array" "jsonb"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."json_object_agg_merge"("jsonb_array" "jsonb"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_user_data_to_organization"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_user_data_to_organization"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_user_data_to_organization"() TO "service_role";



GRANT ALL ON FUNCTION "public"."record_click_with_fraud_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_click_with_fraud_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_click_with_fraud_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."regenerate_all_profile_pictures"() TO "anon";
GRANT ALL ON FUNCTION "public"."regenerate_all_profile_pictures"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."regenerate_all_profile_pictures"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_link_password"("link_id" "uuid", "password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_link_password"("link_id" "uuid", "password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_link_password"("link_id" "uuid", "password" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_daily_analytics"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_daily_analytics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_daily_analytics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_monthly_analytics"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_monthly_analytics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_monthly_analytics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_organization_features"("org_id" "uuid", "plan_id" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."update_organization_features"("org_id" "uuid", "plan_id" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_organization_features"("org_id" "uuid", "plan_id" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_weekly_analytics"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_weekly_analytics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_weekly_analytics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_link_password"("link_id" "uuid", "password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_link_password"("link_id" "uuid", "password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_link_password"("link_id" "uuid", "password" "text") TO "service_role";
























GRANT ALL ON TABLE "public"."analytics_daily" TO "anon";
GRANT ALL ON TABLE "public"."analytics_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_daily" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_monthly" TO "anon";
GRANT ALL ON TABLE "public"."analytics_monthly" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_monthly" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_weekly" TO "anon";
GRANT ALL ON TABLE "public"."analytics_weekly" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_weekly" TO "service_role";



GRANT ALL ON TABLE "public"."bio_links" TO "anon";
GRANT ALL ON TABLE "public"."bio_links" TO "authenticated";
GRANT ALL ON TABLE "public"."bio_links" TO "service_role";



GRANT ALL ON TABLE "public"."bio_pages" TO "anon";
GRANT ALL ON TABLE "public"."bio_pages" TO "authenticated";
GRANT ALL ON TABLE "public"."bio_pages" TO "service_role";



GRANT ALL ON TABLE "public"."bio_social_links" TO "anon";
GRANT ALL ON TABLE "public"."bio_social_links" TO "authenticated";
GRANT ALL ON TABLE "public"."bio_social_links" TO "service_role";



GRANT ALL ON TABLE "public"."cache_metadata" TO "anon";
GRANT ALL ON TABLE "public"."cache_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."cache_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_links" TO "anon";
GRANT ALL ON TABLE "public"."campaign_links" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_links" TO "service_role";



GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."links" TO "anon";
GRANT ALL ON TABLE "public"."links" TO "authenticated";
GRANT ALL ON TABLE "public"."links" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_metrics" TO "anon";
GRANT ALL ON TABLE "public"."campaign_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."clicks" TO "anon";
GRANT ALL ON TABLE "public"."clicks" TO "authenticated";
GRANT ALL ON TABLE "public"."clicks" TO "service_role";



GRANT ALL ON TABLE "public"."clicks_archive" TO "anon";
GRANT ALL ON TABLE "public"."clicks_archive" TO "authenticated";
GRANT ALL ON TABLE "public"."clicks_archive" TO "service_role";



GRANT ALL ON TABLE "public"."clicks_y2025m05" TO "anon";
GRANT ALL ON TABLE "public"."clicks_y2025m05" TO "authenticated";
GRANT ALL ON TABLE "public"."clicks_y2025m05" TO "service_role";



GRANT ALL ON TABLE "public"."clicks_y2025m06" TO "anon";
GRANT ALL ON TABLE "public"."clicks_y2025m06" TO "authenticated";
GRANT ALL ON TABLE "public"."clicks_y2025m06" TO "service_role";



GRANT ALL ON TABLE "public"."clicks_y2025m07" TO "anon";
GRANT ALL ON TABLE "public"."clicks_y2025m07" TO "authenticated";
GRANT ALL ON TABLE "public"."clicks_y2025m07" TO "service_role";



GRANT ALL ON TABLE "public"."clicks_y2025m08" TO "anon";
GRANT ALL ON TABLE "public"."clicks_y2025m08" TO "authenticated";
GRANT ALL ON TABLE "public"."clicks_y2025m08" TO "service_role";



GRANT ALL ON TABLE "public"."clicks_y2025m09" TO "anon";
GRANT ALL ON TABLE "public"."clicks_y2025m09" TO "authenticated";
GRANT ALL ON TABLE "public"."clicks_y2025m09" TO "service_role";



GRANT ALL ON TABLE "public"."clicks_y2025m10" TO "anon";
GRANT ALL ON TABLE "public"."clicks_y2025m10" TO "authenticated";
GRANT ALL ON TABLE "public"."clicks_y2025m10" TO "service_role";



GRANT ALL ON TABLE "public"."custom_domains" TO "anon";
GRANT ALL ON TABLE "public"."custom_domains" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_domains" TO "service_role";



GRANT ALL ON TABLE "public"."fraud_rules" TO "anon";
GRANT ALL ON TABLE "public"."fraud_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."fraud_rules" TO "service_role";



GRANT ALL ON TABLE "public"."link_destinations" TO "anon";
GRANT ALL ON TABLE "public"."link_destinations" TO "authenticated";
GRANT ALL ON TABLE "public"."link_destinations" TO "service_role";



GRANT ALL ON TABLE "public"."link_metadata" TO "anon";
GRANT ALL ON TABLE "public"."link_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."link_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."link_pixels" TO "anon";
GRANT ALL ON TABLE "public"."link_pixels" TO "authenticated";
GRANT ALL ON TABLE "public"."link_pixels" TO "service_role";



GRANT ALL ON TABLE "public"."link_rotation_rules" TO "anon";
GRANT ALL ON TABLE "public"."link_rotation_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."link_rotation_rules" TO "service_role";



GRANT ALL ON TABLE "public"."link_tags" TO "anon";
GRANT ALL ON TABLE "public"."link_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."link_tags" TO "service_role";



GRANT ALL ON TABLE "public"."organization_invitations" TO "anon";
GRANT ALL ON TABLE "public"."organization_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."organization_metrics" TO "anon";
GRANT ALL ON TABLE "public"."organization_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."organization_settings" TO "anon";
GRANT ALL ON TABLE "public"."organization_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_settings" TO "service_role";



GRANT ALL ON TABLE "public"."pagination_metadata" TO "anon";
GRANT ALL ON TABLE "public"."pagination_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."pagination_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."pixels" TO "anon";
GRANT ALL ON TABLE "public"."pixels" TO "authenticated";
GRANT ALL ON TABLE "public"."pixels" TO "service_role";



GRANT ALL ON TABLE "public"."qr_codes" TO "anon";
GRANT ALL ON TABLE "public"."qr_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."qr_codes" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."user_activity" TO "anon";
GRANT ALL ON TABLE "public"."user_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity" TO "service_role";



GRANT ALL ON TABLE "public"."user_consent" TO "anon";
GRANT ALL ON TABLE "public"."user_consent" TO "authenticated";
GRANT ALL ON TABLE "public"."user_consent" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
