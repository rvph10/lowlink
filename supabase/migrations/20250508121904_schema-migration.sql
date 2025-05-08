create table "public"."analytics_daily" (
    "id" uuid not null default uuid_generate_v4(),
    "link_id" uuid not null,
    "date" date not null,
    "click_count" integer not null default 0,
    "unique_visitors" integer not null default 0,
    "countries" jsonb default '{}'::jsonb,
    "browsers" jsonb default '{}'::jsonb,
    "devices" jsonb default '{}'::jsonb,
    "referrers" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."analytics_daily" enable row level security;

create table "public"."analytics_monthly" (
    "id" uuid not null default uuid_generate_v4(),
    "link_id" uuid not null,
    "year_month" character varying(7) not null,
    "start_date" date not null,
    "end_date" date not null,
    "click_count" integer not null default 0,
    "unique_visitors" integer not null default 0,
    "countries" jsonb default '{}'::jsonb,
    "browsers" jsonb default '{}'::jsonb,
    "devices" jsonb default '{}'::jsonb,
    "referrers" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."analytics_monthly" enable row level security;

create table "public"."analytics_weekly" (
    "id" uuid not null default uuid_generate_v4(),
    "link_id" uuid not null,
    "year_week" character varying(8) not null,
    "start_date" date not null,
    "end_date" date not null,
    "click_count" integer not null default 0,
    "unique_visitors" integer not null default 0,
    "countries" jsonb default '{}'::jsonb,
    "browsers" jsonb default '{}'::jsonb,
    "devices" jsonb default '{}'::jsonb,
    "referrers" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."analytics_weekly" enable row level security;

create table "public"."cache_metadata" (
    "id" uuid not null default uuid_generate_v4(),
    "cache_key" character varying(255) not null,
    "data_type" character varying(50) not null,
    "entity_id" uuid not null,
    "version" integer not null default 1,
    "ttl" integer,
    "last_updated" timestamp with time zone default now()
);


alter table "public"."cache_metadata" enable row level security;

create table "public"."clicks" (
    "id" uuid not null default uuid_generate_v4(),
    "link_id" uuid not null,
    "ip_address" character varying(45),
    "user_agent" text,
    "referrer" text,
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone not null default now()
) partition by RANGE (created_at);


alter table "public"."clicks" enable row level security;

create table "public"."clicks_archive" (
    "id" uuid,
    "link_id" uuid not null,
    "ip_address" character varying(45),
    "user_agent" text,
    "referrer" text,
    "country" character varying(2),
    "city" character varying(100),
    "device_type" character varying(20),
    "browser" character varying(50),
    "os" character varying(50),
    "created_at" timestamp with time zone,
    "archived_at" timestamp with time zone default now()
);


create table "public"."clicks_y2025m05" partition of "public"."clicks" FOR VALUES FROM ('2025-05-01 00:00:00+00') TO ('2025-06-01 00:00:00+00');


create table "public"."clicks_y2025m06" partition of "public"."clicks" FOR VALUES FROM ('2025-06-01 00:00:00+00') TO ('2025-07-01 00:00:00+00');


create table "public"."clicks_y2025m07" partition of "public"."clicks" FOR VALUES FROM ('2025-07-01 00:00:00+00') TO ('2025-08-01 00:00:00+00');


create table "public"."clicks_y2025m08" partition of "public"."clicks" FOR VALUES FROM ('2025-08-01 00:00:00+00') TO ('2025-09-01 00:00:00+00');


create table "public"."clicks_y2025m09" partition of "public"."clicks" FOR VALUES FROM ('2025-09-01 00:00:00+00') TO ('2025-10-01 00:00:00+00');


create table "public"."clicks_y2025m10" partition of "public"."clicks" FOR VALUES FROM ('2025-10-01 00:00:00+00') TO ('2025-11-01 00:00:00+00');


create table "public"."custom_domains" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "domain" character varying(255) not null,
    "is_verified" boolean default false,
    "verification_code" character varying(50),
    "created_at" timestamp with time zone default now(),
    "verified_at" timestamp with time zone
);


alter table "public"."custom_domains" enable row level security;

create table "public"."link_tags" (
    "link_id" uuid not null,
    "tag_id" uuid not null
);


alter table "public"."link_tags" enable row level security;

create table "public"."links" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "original_url" text not null,
    "short_code" character varying(10) not null,
    "title" character varying(255),
    "description" text,
    "is_active" boolean default true,
    "click_count" bigint default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone,
    "cache_version" integer default 1,
    "last_cached_at" timestamp with time zone
);


alter table "public"."links" enable row level security;

create table "public"."pagination_metadata" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "resource_type" character varying(50) not null,
    "cursor_key" character varying(255) not null,
    "next_cursor" character varying(100),
    "prev_cursor" character varying(100),
    "page_size" integer not null,
    "total_count" integer,
    "cache_version" integer not null default 1,
    "expires_at" timestamp with time zone not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."pagination_metadata" enable row level security;

create table "public"."subscriptions" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "plan_id" character varying(50) not null,
    "status" character varying(20) not null,
    "current_period_start" timestamp with time zone not null,
    "current_period_end" timestamp with time zone not null,
    "cancel_at_period_end" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "payment_provider" character varying(20),
    "payment_provider_subscription_id" character varying(100)
);


alter table "public"."subscriptions" enable row level security;

create table "public"."tags" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "name" character varying(50) not null,
    "color" character varying(7) default '#000000'::character varying,
    "created_at" timestamp with time zone default now()
);


alter table "public"."tags" enable row level security;

create table "public"."user_settings" (
    "user_id" uuid not null,
    "default_domain" character varying(255),
    "custom_domains" jsonb default '[]'::jsonb,
    "analytics_enabled" boolean default true,
    "theme" character varying(20) default 'light'::character varying,
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_settings" enable row level security;

CREATE UNIQUE INDEX analytics_daily_link_id_date_key ON public.analytics_daily USING btree (link_id, date);

CREATE UNIQUE INDEX analytics_daily_pkey ON public.analytics_daily USING btree (id);

CREATE UNIQUE INDEX analytics_monthly_link_id_year_month_key ON public.analytics_monthly USING btree (link_id, year_month);

CREATE UNIQUE INDEX analytics_monthly_pkey ON public.analytics_monthly USING btree (id);

CREATE UNIQUE INDEX analytics_weekly_link_id_year_week_key ON public.analytics_weekly USING btree (link_id, year_week);

CREATE UNIQUE INDEX analytics_weekly_pkey ON public.analytics_weekly USING btree (id);

CREATE UNIQUE INDEX cache_metadata_cache_key_key ON public.cache_metadata USING btree (cache_key);

CREATE UNIQUE INDEX cache_metadata_pkey ON public.cache_metadata USING btree (id);

CREATE UNIQUE INDEX clicks_pkey ON ONLY public.clicks USING btree (id, created_at);

CREATE INDEX clicks_y2025m05_created_at_idx ON public.clicks_y2025m05 USING btree (created_at DESC);

CREATE INDEX clicks_y2025m05_link_id_idx ON public.clicks_y2025m05 USING btree (link_id);

CREATE UNIQUE INDEX clicks_y2025m05_pkey ON public.clicks_y2025m05 USING btree (id, created_at);

CREATE INDEX clicks_y2025m06_created_at_idx ON public.clicks_y2025m06 USING btree (created_at DESC);

CREATE INDEX clicks_y2025m06_link_id_idx ON public.clicks_y2025m06 USING btree (link_id);

CREATE UNIQUE INDEX clicks_y2025m06_pkey ON public.clicks_y2025m06 USING btree (id, created_at);

CREATE INDEX clicks_y2025m07_created_at_idx ON public.clicks_y2025m07 USING btree (created_at DESC);

CREATE INDEX clicks_y2025m07_link_id_idx ON public.clicks_y2025m07 USING btree (link_id);

CREATE UNIQUE INDEX clicks_y2025m07_pkey ON public.clicks_y2025m07 USING btree (id, created_at);

CREATE INDEX clicks_y2025m08_created_at_idx ON public.clicks_y2025m08 USING btree (created_at DESC);

CREATE INDEX clicks_y2025m08_link_id_idx ON public.clicks_y2025m08 USING btree (link_id);

CREATE UNIQUE INDEX clicks_y2025m08_pkey ON public.clicks_y2025m08 USING btree (id, created_at);

CREATE INDEX clicks_y2025m09_created_at_idx ON public.clicks_y2025m09 USING btree (created_at DESC);

CREATE INDEX clicks_y2025m09_link_id_idx ON public.clicks_y2025m09 USING btree (link_id);

CREATE UNIQUE INDEX clicks_y2025m09_pkey ON public.clicks_y2025m09 USING btree (id, created_at);

CREATE INDEX clicks_y2025m10_created_at_idx ON public.clicks_y2025m10 USING btree (created_at DESC);

CREATE INDEX clicks_y2025m10_link_id_idx ON public.clicks_y2025m10 USING btree (link_id);

CREATE UNIQUE INDEX clicks_y2025m10_pkey ON public.clicks_y2025m10 USING btree (id, created_at);

CREATE UNIQUE INDEX custom_domains_domain_key ON public.custom_domains USING btree (domain);

CREATE UNIQUE INDEX custom_domains_pkey ON public.custom_domains USING btree (id);

CREATE INDEX idx_analytics_daily_link_id_date ON public.analytics_daily USING btree (link_id, date);

CREATE INDEX idx_analytics_monthly_link_id_year_month ON public.analytics_monthly USING btree (link_id, year_month);

CREATE INDEX idx_analytics_weekly_link_id_year_week ON public.analytics_weekly USING btree (link_id, year_week);

CREATE INDEX idx_cache_metadata_data_type ON public.cache_metadata USING btree (data_type);

CREATE INDEX idx_cache_metadata_entity_id ON public.cache_metadata USING btree (entity_id);

CREATE INDEX idx_clicks_created_at ON ONLY public.clicks USING btree (created_at DESC);

CREATE INDEX idx_clicks_link_id ON ONLY public.clicks USING btree (link_id);

CREATE INDEX idx_custom_domains_user_id ON public.custom_domains USING btree (user_id);

CREATE INDEX idx_links_cache_version ON public.links USING btree (cache_version);

CREATE INDEX idx_links_created_at ON public.links USING btree (created_at DESC);

CREATE INDEX idx_links_short_code ON public.links USING btree (short_code);

CREATE INDEX idx_links_user_id ON public.links USING btree (user_id);

CREATE INDEX idx_links_user_id_created_at ON public.links USING btree (user_id, created_at DESC);

CREATE INDEX idx_links_user_id_id ON public.links USING btree (user_id, id);

CREATE INDEX idx_pagination_metadata_user_resource ON public.pagination_metadata USING btree (user_id, resource_type);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);

CREATE INDEX idx_tags_user_id ON public.tags USING btree (user_id);

CREATE UNIQUE INDEX link_tags_pkey ON public.link_tags USING btree (link_id, tag_id);

CREATE UNIQUE INDEX links_pkey ON public.links USING btree (id);

CREATE UNIQUE INDEX links_short_code_key ON public.links USING btree (short_code);

CREATE UNIQUE INDEX pagination_metadata_pkey ON public.pagination_metadata USING btree (id);

CREATE UNIQUE INDEX pagination_metadata_user_id_resource_type_cursor_key_key ON public.pagination_metadata USING btree (user_id, resource_type, cursor_key);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (user_id);

alter table "public"."analytics_daily" add constraint "analytics_daily_pkey" PRIMARY KEY using index "analytics_daily_pkey";

alter table "public"."analytics_monthly" add constraint "analytics_monthly_pkey" PRIMARY KEY using index "analytics_monthly_pkey";

alter table "public"."analytics_weekly" add constraint "analytics_weekly_pkey" PRIMARY KEY using index "analytics_weekly_pkey";

alter table "public"."cache_metadata" add constraint "cache_metadata_pkey" PRIMARY KEY using index "cache_metadata_pkey";

alter table "public"."clicks" add constraint "clicks_pkey" PRIMARY KEY using index "clicks_pkey";

alter table "public"."clicks_y2025m05" add constraint "clicks_y2025m05_pkey" PRIMARY KEY using index "clicks_y2025m05_pkey";

alter table "public"."clicks_y2025m06" add constraint "clicks_y2025m06_pkey" PRIMARY KEY using index "clicks_y2025m06_pkey";

alter table "public"."clicks_y2025m07" add constraint "clicks_y2025m07_pkey" PRIMARY KEY using index "clicks_y2025m07_pkey";

alter table "public"."clicks_y2025m08" add constraint "clicks_y2025m08_pkey" PRIMARY KEY using index "clicks_y2025m08_pkey";

alter table "public"."clicks_y2025m09" add constraint "clicks_y2025m09_pkey" PRIMARY KEY using index "clicks_y2025m09_pkey";

alter table "public"."clicks_y2025m10" add constraint "clicks_y2025m10_pkey" PRIMARY KEY using index "clicks_y2025m10_pkey";

alter table "public"."custom_domains" add constraint "custom_domains_pkey" PRIMARY KEY using index "custom_domains_pkey";

alter table "public"."link_tags" add constraint "link_tags_pkey" PRIMARY KEY using index "link_tags_pkey";

alter table "public"."links" add constraint "links_pkey" PRIMARY KEY using index "links_pkey";

alter table "public"."pagination_metadata" add constraint "pagination_metadata_pkey" PRIMARY KEY using index "pagination_metadata_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."user_settings" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."analytics_daily" add constraint "analytics_daily_link_id_date_key" UNIQUE using index "analytics_daily_link_id_date_key";

alter table "public"."analytics_daily" add constraint "analytics_daily_link_id_fkey" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."analytics_daily" validate constraint "analytics_daily_link_id_fkey";

alter table "public"."analytics_monthly" add constraint "analytics_monthly_link_id_fkey" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."analytics_monthly" validate constraint "analytics_monthly_link_id_fkey";

alter table "public"."analytics_monthly" add constraint "analytics_monthly_link_id_year_month_key" UNIQUE using index "analytics_monthly_link_id_year_month_key";

alter table "public"."analytics_weekly" add constraint "analytics_weekly_link_id_fkey" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."analytics_weekly" validate constraint "analytics_weekly_link_id_fkey";

alter table "public"."analytics_weekly" add constraint "analytics_weekly_link_id_year_week_key" UNIQUE using index "analytics_weekly_link_id_year_week_key";

alter table "public"."cache_metadata" add constraint "cache_metadata_cache_key_key" UNIQUE using index "cache_metadata_cache_key_key";

alter table "public"."clicks_y2025m05" add constraint "fk_clicks_y2025m05_link_id" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."clicks_y2025m05" validate constraint "fk_clicks_y2025m05_link_id";

alter table "public"."clicks_y2025m06" add constraint "fk_clicks_y2025m06_link_id" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."clicks_y2025m06" validate constraint "fk_clicks_y2025m06_link_id";

alter table "public"."clicks_y2025m07" add constraint "fk_clicks_y2025m07_link_id" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."clicks_y2025m07" validate constraint "fk_clicks_y2025m07_link_id";

alter table "public"."clicks_y2025m08" add constraint "fk_clicks_y2025m08_link_id" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."clicks_y2025m08" validate constraint "fk_clicks_y2025m08_link_id";

alter table "public"."clicks_y2025m09" add constraint "fk_clicks_y2025m09_link_id" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."clicks_y2025m09" validate constraint "fk_clicks_y2025m09_link_id";

alter table "public"."clicks_y2025m10" add constraint "fk_clicks_y2025m10_link_id" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."clicks_y2025m10" validate constraint "fk_clicks_y2025m10_link_id";

alter table "public"."custom_domains" add constraint "custom_domains_domain_key" UNIQUE using index "custom_domains_domain_key";

alter table "public"."custom_domains" add constraint "custom_domains_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."custom_domains" validate constraint "custom_domains_user_id_fkey";

alter table "public"."link_tags" add constraint "link_tags_link_id_fkey" FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE not valid;

alter table "public"."link_tags" validate constraint "link_tags_link_id_fkey";

alter table "public"."link_tags" add constraint "link_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;

alter table "public"."link_tags" validate constraint "link_tags_tag_id_fkey";

alter table "public"."links" add constraint "links_short_code_key" UNIQUE using index "links_short_code_key";

alter table "public"."links" add constraint "links_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."links" validate constraint "links_user_id_fkey";

alter table "public"."links" add constraint "short_code_length" CHECK (((length((short_code)::text) >= 4) AND (length((short_code)::text) <= 10))) not valid;

alter table "public"."links" validate constraint "short_code_length";

alter table "public"."pagination_metadata" add constraint "pagination_metadata_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."pagination_metadata" validate constraint "pagination_metadata_user_id_fkey";

alter table "public"."pagination_metadata" add constraint "pagination_metadata_user_id_resource_type_cursor_key_key" UNIQUE using index "pagination_metadata_user_id_resource_type_cursor_key_key";

alter table "public"."subscriptions" add constraint "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_user_id_fkey";

alter table "public"."tags" add constraint "tags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."tags" validate constraint "tags_user_id_fkey";

alter table "public"."user_settings" add constraint "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "user_settings_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.archive_old_clicks(retention_days integer DEFAULT 90)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_clicks_partition(year integer, month integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.generate_base62_id(length integer DEFAULT 6)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.invalidate_link_cache()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_daily_analytics()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."analytics_daily" to "anon";

grant insert on table "public"."analytics_daily" to "anon";

grant references on table "public"."analytics_daily" to "anon";

grant select on table "public"."analytics_daily" to "anon";

grant trigger on table "public"."analytics_daily" to "anon";

grant truncate on table "public"."analytics_daily" to "anon";

grant update on table "public"."analytics_daily" to "anon";

grant delete on table "public"."analytics_daily" to "authenticated";

grant insert on table "public"."analytics_daily" to "authenticated";

grant references on table "public"."analytics_daily" to "authenticated";

grant select on table "public"."analytics_daily" to "authenticated";

grant trigger on table "public"."analytics_daily" to "authenticated";

grant truncate on table "public"."analytics_daily" to "authenticated";

grant update on table "public"."analytics_daily" to "authenticated";

grant delete on table "public"."analytics_daily" to "service_role";

grant insert on table "public"."analytics_daily" to "service_role";

grant references on table "public"."analytics_daily" to "service_role";

grant select on table "public"."analytics_daily" to "service_role";

grant trigger on table "public"."analytics_daily" to "service_role";

grant truncate on table "public"."analytics_daily" to "service_role";

grant update on table "public"."analytics_daily" to "service_role";

grant delete on table "public"."analytics_monthly" to "anon";

grant insert on table "public"."analytics_monthly" to "anon";

grant references on table "public"."analytics_monthly" to "anon";

grant select on table "public"."analytics_monthly" to "anon";

grant trigger on table "public"."analytics_monthly" to "anon";

grant truncate on table "public"."analytics_monthly" to "anon";

grant update on table "public"."analytics_monthly" to "anon";

grant delete on table "public"."analytics_monthly" to "authenticated";

grant insert on table "public"."analytics_monthly" to "authenticated";

grant references on table "public"."analytics_monthly" to "authenticated";

grant select on table "public"."analytics_monthly" to "authenticated";

grant trigger on table "public"."analytics_monthly" to "authenticated";

grant truncate on table "public"."analytics_monthly" to "authenticated";

grant update on table "public"."analytics_monthly" to "authenticated";

grant delete on table "public"."analytics_monthly" to "service_role";

grant insert on table "public"."analytics_monthly" to "service_role";

grant references on table "public"."analytics_monthly" to "service_role";

grant select on table "public"."analytics_monthly" to "service_role";

grant trigger on table "public"."analytics_monthly" to "service_role";

grant truncate on table "public"."analytics_monthly" to "service_role";

grant update on table "public"."analytics_monthly" to "service_role";

grant delete on table "public"."analytics_weekly" to "anon";

grant insert on table "public"."analytics_weekly" to "anon";

grant references on table "public"."analytics_weekly" to "anon";

grant select on table "public"."analytics_weekly" to "anon";

grant trigger on table "public"."analytics_weekly" to "anon";

grant truncate on table "public"."analytics_weekly" to "anon";

grant update on table "public"."analytics_weekly" to "anon";

grant delete on table "public"."analytics_weekly" to "authenticated";

grant insert on table "public"."analytics_weekly" to "authenticated";

grant references on table "public"."analytics_weekly" to "authenticated";

grant select on table "public"."analytics_weekly" to "authenticated";

grant trigger on table "public"."analytics_weekly" to "authenticated";

grant truncate on table "public"."analytics_weekly" to "authenticated";

grant update on table "public"."analytics_weekly" to "authenticated";

grant delete on table "public"."analytics_weekly" to "service_role";

grant insert on table "public"."analytics_weekly" to "service_role";

grant references on table "public"."analytics_weekly" to "service_role";

grant select on table "public"."analytics_weekly" to "service_role";

grant trigger on table "public"."analytics_weekly" to "service_role";

grant truncate on table "public"."analytics_weekly" to "service_role";

grant update on table "public"."analytics_weekly" to "service_role";

grant delete on table "public"."cache_metadata" to "anon";

grant insert on table "public"."cache_metadata" to "anon";

grant references on table "public"."cache_metadata" to "anon";

grant select on table "public"."cache_metadata" to "anon";

grant trigger on table "public"."cache_metadata" to "anon";

grant truncate on table "public"."cache_metadata" to "anon";

grant update on table "public"."cache_metadata" to "anon";

grant delete on table "public"."cache_metadata" to "authenticated";

grant insert on table "public"."cache_metadata" to "authenticated";

grant references on table "public"."cache_metadata" to "authenticated";

grant select on table "public"."cache_metadata" to "authenticated";

grant trigger on table "public"."cache_metadata" to "authenticated";

grant truncate on table "public"."cache_metadata" to "authenticated";

grant update on table "public"."cache_metadata" to "authenticated";

grant delete on table "public"."cache_metadata" to "service_role";

grant insert on table "public"."cache_metadata" to "service_role";

grant references on table "public"."cache_metadata" to "service_role";

grant select on table "public"."cache_metadata" to "service_role";

grant trigger on table "public"."cache_metadata" to "service_role";

grant truncate on table "public"."cache_metadata" to "service_role";

grant update on table "public"."cache_metadata" to "service_role";

grant delete on table "public"."clicks" to "anon";

grant insert on table "public"."clicks" to "anon";

grant references on table "public"."clicks" to "anon";

grant select on table "public"."clicks" to "anon";

grant trigger on table "public"."clicks" to "anon";

grant truncate on table "public"."clicks" to "anon";

grant update on table "public"."clicks" to "anon";

grant delete on table "public"."clicks" to "authenticated";

grant insert on table "public"."clicks" to "authenticated";

grant references on table "public"."clicks" to "authenticated";

grant select on table "public"."clicks" to "authenticated";

grant trigger on table "public"."clicks" to "authenticated";

grant truncate on table "public"."clicks" to "authenticated";

grant update on table "public"."clicks" to "authenticated";

grant delete on table "public"."clicks" to "service_role";

grant insert on table "public"."clicks" to "service_role";

grant references on table "public"."clicks" to "service_role";

grant select on table "public"."clicks" to "service_role";

grant trigger on table "public"."clicks" to "service_role";

grant truncate on table "public"."clicks" to "service_role";

grant update on table "public"."clicks" to "service_role";

grant delete on table "public"."clicks_archive" to "anon";

grant insert on table "public"."clicks_archive" to "anon";

grant references on table "public"."clicks_archive" to "anon";

grant select on table "public"."clicks_archive" to "anon";

grant trigger on table "public"."clicks_archive" to "anon";

grant truncate on table "public"."clicks_archive" to "anon";

grant update on table "public"."clicks_archive" to "anon";

grant delete on table "public"."clicks_archive" to "authenticated";

grant insert on table "public"."clicks_archive" to "authenticated";

grant references on table "public"."clicks_archive" to "authenticated";

grant select on table "public"."clicks_archive" to "authenticated";

grant trigger on table "public"."clicks_archive" to "authenticated";

grant truncate on table "public"."clicks_archive" to "authenticated";

grant update on table "public"."clicks_archive" to "authenticated";

grant delete on table "public"."clicks_archive" to "service_role";

grant insert on table "public"."clicks_archive" to "service_role";

grant references on table "public"."clicks_archive" to "service_role";

grant select on table "public"."clicks_archive" to "service_role";

grant trigger on table "public"."clicks_archive" to "service_role";

grant truncate on table "public"."clicks_archive" to "service_role";

grant update on table "public"."clicks_archive" to "service_role";

grant delete on table "public"."clicks_y2025m05" to "anon";

grant insert on table "public"."clicks_y2025m05" to "anon";

grant references on table "public"."clicks_y2025m05" to "anon";

grant select on table "public"."clicks_y2025m05" to "anon";

grant trigger on table "public"."clicks_y2025m05" to "anon";

grant truncate on table "public"."clicks_y2025m05" to "anon";

grant update on table "public"."clicks_y2025m05" to "anon";

grant delete on table "public"."clicks_y2025m05" to "authenticated";

grant insert on table "public"."clicks_y2025m05" to "authenticated";

grant references on table "public"."clicks_y2025m05" to "authenticated";

grant select on table "public"."clicks_y2025m05" to "authenticated";

grant trigger on table "public"."clicks_y2025m05" to "authenticated";

grant truncate on table "public"."clicks_y2025m05" to "authenticated";

grant update on table "public"."clicks_y2025m05" to "authenticated";

grant delete on table "public"."clicks_y2025m05" to "service_role";

grant insert on table "public"."clicks_y2025m05" to "service_role";

grant references on table "public"."clicks_y2025m05" to "service_role";

grant select on table "public"."clicks_y2025m05" to "service_role";

grant trigger on table "public"."clicks_y2025m05" to "service_role";

grant truncate on table "public"."clicks_y2025m05" to "service_role";

grant update on table "public"."clicks_y2025m05" to "service_role";

grant delete on table "public"."clicks_y2025m06" to "anon";

grant insert on table "public"."clicks_y2025m06" to "anon";

grant references on table "public"."clicks_y2025m06" to "anon";

grant select on table "public"."clicks_y2025m06" to "anon";

grant trigger on table "public"."clicks_y2025m06" to "anon";

grant truncate on table "public"."clicks_y2025m06" to "anon";

grant update on table "public"."clicks_y2025m06" to "anon";

grant delete on table "public"."clicks_y2025m06" to "authenticated";

grant insert on table "public"."clicks_y2025m06" to "authenticated";

grant references on table "public"."clicks_y2025m06" to "authenticated";

grant select on table "public"."clicks_y2025m06" to "authenticated";

grant trigger on table "public"."clicks_y2025m06" to "authenticated";

grant truncate on table "public"."clicks_y2025m06" to "authenticated";

grant update on table "public"."clicks_y2025m06" to "authenticated";

grant delete on table "public"."clicks_y2025m06" to "service_role";

grant insert on table "public"."clicks_y2025m06" to "service_role";

grant references on table "public"."clicks_y2025m06" to "service_role";

grant select on table "public"."clicks_y2025m06" to "service_role";

grant trigger on table "public"."clicks_y2025m06" to "service_role";

grant truncate on table "public"."clicks_y2025m06" to "service_role";

grant update on table "public"."clicks_y2025m06" to "service_role";

grant delete on table "public"."clicks_y2025m07" to "anon";

grant insert on table "public"."clicks_y2025m07" to "anon";

grant references on table "public"."clicks_y2025m07" to "anon";

grant select on table "public"."clicks_y2025m07" to "anon";

grant trigger on table "public"."clicks_y2025m07" to "anon";

grant truncate on table "public"."clicks_y2025m07" to "anon";

grant update on table "public"."clicks_y2025m07" to "anon";

grant delete on table "public"."clicks_y2025m07" to "authenticated";

grant insert on table "public"."clicks_y2025m07" to "authenticated";

grant references on table "public"."clicks_y2025m07" to "authenticated";

grant select on table "public"."clicks_y2025m07" to "authenticated";

grant trigger on table "public"."clicks_y2025m07" to "authenticated";

grant truncate on table "public"."clicks_y2025m07" to "authenticated";

grant update on table "public"."clicks_y2025m07" to "authenticated";

grant delete on table "public"."clicks_y2025m07" to "service_role";

grant insert on table "public"."clicks_y2025m07" to "service_role";

grant references on table "public"."clicks_y2025m07" to "service_role";

grant select on table "public"."clicks_y2025m07" to "service_role";

grant trigger on table "public"."clicks_y2025m07" to "service_role";

grant truncate on table "public"."clicks_y2025m07" to "service_role";

grant update on table "public"."clicks_y2025m07" to "service_role";

grant delete on table "public"."clicks_y2025m08" to "anon";

grant insert on table "public"."clicks_y2025m08" to "anon";

grant references on table "public"."clicks_y2025m08" to "anon";

grant select on table "public"."clicks_y2025m08" to "anon";

grant trigger on table "public"."clicks_y2025m08" to "anon";

grant truncate on table "public"."clicks_y2025m08" to "anon";

grant update on table "public"."clicks_y2025m08" to "anon";

grant delete on table "public"."clicks_y2025m08" to "authenticated";

grant insert on table "public"."clicks_y2025m08" to "authenticated";

grant references on table "public"."clicks_y2025m08" to "authenticated";

grant select on table "public"."clicks_y2025m08" to "authenticated";

grant trigger on table "public"."clicks_y2025m08" to "authenticated";

grant truncate on table "public"."clicks_y2025m08" to "authenticated";

grant update on table "public"."clicks_y2025m08" to "authenticated";

grant delete on table "public"."clicks_y2025m08" to "service_role";

grant insert on table "public"."clicks_y2025m08" to "service_role";

grant references on table "public"."clicks_y2025m08" to "service_role";

grant select on table "public"."clicks_y2025m08" to "service_role";

grant trigger on table "public"."clicks_y2025m08" to "service_role";

grant truncate on table "public"."clicks_y2025m08" to "service_role";

grant update on table "public"."clicks_y2025m08" to "service_role";

grant delete on table "public"."clicks_y2025m09" to "anon";

grant insert on table "public"."clicks_y2025m09" to "anon";

grant references on table "public"."clicks_y2025m09" to "anon";

grant select on table "public"."clicks_y2025m09" to "anon";

grant trigger on table "public"."clicks_y2025m09" to "anon";

grant truncate on table "public"."clicks_y2025m09" to "anon";

grant update on table "public"."clicks_y2025m09" to "anon";

grant delete on table "public"."clicks_y2025m09" to "authenticated";

grant insert on table "public"."clicks_y2025m09" to "authenticated";

grant references on table "public"."clicks_y2025m09" to "authenticated";

grant select on table "public"."clicks_y2025m09" to "authenticated";

grant trigger on table "public"."clicks_y2025m09" to "authenticated";

grant truncate on table "public"."clicks_y2025m09" to "authenticated";

grant update on table "public"."clicks_y2025m09" to "authenticated";

grant delete on table "public"."clicks_y2025m09" to "service_role";

grant insert on table "public"."clicks_y2025m09" to "service_role";

grant references on table "public"."clicks_y2025m09" to "service_role";

grant select on table "public"."clicks_y2025m09" to "service_role";

grant trigger on table "public"."clicks_y2025m09" to "service_role";

grant truncate on table "public"."clicks_y2025m09" to "service_role";

grant update on table "public"."clicks_y2025m09" to "service_role";

grant delete on table "public"."clicks_y2025m10" to "anon";

grant insert on table "public"."clicks_y2025m10" to "anon";

grant references on table "public"."clicks_y2025m10" to "anon";

grant select on table "public"."clicks_y2025m10" to "anon";

grant trigger on table "public"."clicks_y2025m10" to "anon";

grant truncate on table "public"."clicks_y2025m10" to "anon";

grant update on table "public"."clicks_y2025m10" to "anon";

grant delete on table "public"."clicks_y2025m10" to "authenticated";

grant insert on table "public"."clicks_y2025m10" to "authenticated";

grant references on table "public"."clicks_y2025m10" to "authenticated";

grant select on table "public"."clicks_y2025m10" to "authenticated";

grant trigger on table "public"."clicks_y2025m10" to "authenticated";

grant truncate on table "public"."clicks_y2025m10" to "authenticated";

grant update on table "public"."clicks_y2025m10" to "authenticated";

grant delete on table "public"."clicks_y2025m10" to "service_role";

grant insert on table "public"."clicks_y2025m10" to "service_role";

grant references on table "public"."clicks_y2025m10" to "service_role";

grant select on table "public"."clicks_y2025m10" to "service_role";

grant trigger on table "public"."clicks_y2025m10" to "service_role";

grant truncate on table "public"."clicks_y2025m10" to "service_role";

grant update on table "public"."clicks_y2025m10" to "service_role";

grant delete on table "public"."custom_domains" to "anon";

grant insert on table "public"."custom_domains" to "anon";

grant references on table "public"."custom_domains" to "anon";

grant select on table "public"."custom_domains" to "anon";

grant trigger on table "public"."custom_domains" to "anon";

grant truncate on table "public"."custom_domains" to "anon";

grant update on table "public"."custom_domains" to "anon";

grant delete on table "public"."custom_domains" to "authenticated";

grant insert on table "public"."custom_domains" to "authenticated";

grant references on table "public"."custom_domains" to "authenticated";

grant select on table "public"."custom_domains" to "authenticated";

grant trigger on table "public"."custom_domains" to "authenticated";

grant truncate on table "public"."custom_domains" to "authenticated";

grant update on table "public"."custom_domains" to "authenticated";

grant delete on table "public"."custom_domains" to "service_role";

grant insert on table "public"."custom_domains" to "service_role";

grant references on table "public"."custom_domains" to "service_role";

grant select on table "public"."custom_domains" to "service_role";

grant trigger on table "public"."custom_domains" to "service_role";

grant truncate on table "public"."custom_domains" to "service_role";

grant update on table "public"."custom_domains" to "service_role";

grant delete on table "public"."link_tags" to "anon";

grant insert on table "public"."link_tags" to "anon";

grant references on table "public"."link_tags" to "anon";

grant select on table "public"."link_tags" to "anon";

grant trigger on table "public"."link_tags" to "anon";

grant truncate on table "public"."link_tags" to "anon";

grant update on table "public"."link_tags" to "anon";

grant delete on table "public"."link_tags" to "authenticated";

grant insert on table "public"."link_tags" to "authenticated";

grant references on table "public"."link_tags" to "authenticated";

grant select on table "public"."link_tags" to "authenticated";

grant trigger on table "public"."link_tags" to "authenticated";

grant truncate on table "public"."link_tags" to "authenticated";

grant update on table "public"."link_tags" to "authenticated";

grant delete on table "public"."link_tags" to "service_role";

grant insert on table "public"."link_tags" to "service_role";

grant references on table "public"."link_tags" to "service_role";

grant select on table "public"."link_tags" to "service_role";

grant trigger on table "public"."link_tags" to "service_role";

grant truncate on table "public"."link_tags" to "service_role";

grant update on table "public"."link_tags" to "service_role";

grant delete on table "public"."links" to "anon";

grant insert on table "public"."links" to "anon";

grant references on table "public"."links" to "anon";

grant select on table "public"."links" to "anon";

grant trigger on table "public"."links" to "anon";

grant truncate on table "public"."links" to "anon";

grant update on table "public"."links" to "anon";

grant delete on table "public"."links" to "authenticated";

grant insert on table "public"."links" to "authenticated";

grant references on table "public"."links" to "authenticated";

grant select on table "public"."links" to "authenticated";

grant trigger on table "public"."links" to "authenticated";

grant truncate on table "public"."links" to "authenticated";

grant update on table "public"."links" to "authenticated";

grant delete on table "public"."links" to "service_role";

grant insert on table "public"."links" to "service_role";

grant references on table "public"."links" to "service_role";

grant select on table "public"."links" to "service_role";

grant trigger on table "public"."links" to "service_role";

grant truncate on table "public"."links" to "service_role";

grant update on table "public"."links" to "service_role";

grant delete on table "public"."pagination_metadata" to "anon";

grant insert on table "public"."pagination_metadata" to "anon";

grant references on table "public"."pagination_metadata" to "anon";

grant select on table "public"."pagination_metadata" to "anon";

grant trigger on table "public"."pagination_metadata" to "anon";

grant truncate on table "public"."pagination_metadata" to "anon";

grant update on table "public"."pagination_metadata" to "anon";

grant delete on table "public"."pagination_metadata" to "authenticated";

grant insert on table "public"."pagination_metadata" to "authenticated";

grant references on table "public"."pagination_metadata" to "authenticated";

grant select on table "public"."pagination_metadata" to "authenticated";

grant trigger on table "public"."pagination_metadata" to "authenticated";

grant truncate on table "public"."pagination_metadata" to "authenticated";

grant update on table "public"."pagination_metadata" to "authenticated";

grant delete on table "public"."pagination_metadata" to "service_role";

grant insert on table "public"."pagination_metadata" to "service_role";

grant references on table "public"."pagination_metadata" to "service_role";

grant select on table "public"."pagination_metadata" to "service_role";

grant trigger on table "public"."pagination_metadata" to "service_role";

grant truncate on table "public"."pagination_metadata" to "service_role";

grant update on table "public"."pagination_metadata" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

grant delete on table "public"."user_settings" to "anon";

grant insert on table "public"."user_settings" to "anon";

grant references on table "public"."user_settings" to "anon";

grant select on table "public"."user_settings" to "anon";

grant trigger on table "public"."user_settings" to "anon";

grant truncate on table "public"."user_settings" to "anon";

grant update on table "public"."user_settings" to "anon";

grant delete on table "public"."user_settings" to "authenticated";

grant insert on table "public"."user_settings" to "authenticated";

grant references on table "public"."user_settings" to "authenticated";

grant select on table "public"."user_settings" to "authenticated";

grant trigger on table "public"."user_settings" to "authenticated";

grant truncate on table "public"."user_settings" to "authenticated";

grant update on table "public"."user_settings" to "authenticated";

grant delete on table "public"."user_settings" to "service_role";

grant insert on table "public"."user_settings" to "service_role";

grant references on table "public"."user_settings" to "service_role";

grant select on table "public"."user_settings" to "service_role";

grant trigger on table "public"."user_settings" to "service_role";

grant truncate on table "public"."user_settings" to "service_role";

grant update on table "public"."user_settings" to "service_role";

create policy "admin_all_access"
on "public"."links"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND (users.is_admin = true)))));


create policy "links_delete_policy"
on "public"."links"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "links_insert_policy"
on "public"."links"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "links_public_access"
on "public"."links"
as permissive
for select
to public
using ((is_active = true));


create policy "links_select_policy"
on "public"."links"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "links_update_policy"
on "public"."links"
as permissive
for update
to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_analytics_daily_updated_at BEFORE UPDATE ON public.analytics_daily FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_monthly_updated_at BEFORE UPDATE ON public.analytics_monthly FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_weekly_updated_at BEFORE UPDATE ON public.analytics_weekly FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_analytics_trigger AFTER INSERT ON public.clicks REFERENCING NEW TABLE AS inserted FOR EACH STATEMENT EXECUTE FUNCTION update_daily_analytics();

CREATE TRIGGER invalidate_link_cache_trigger BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE FUNCTION invalidate_link_cache();

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


