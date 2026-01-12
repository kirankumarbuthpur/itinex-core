# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


Itinex - Name and Context : 
Itinext is actually a pretty solid name for a travel-related website! Here's why:

Short and Snappy: It's easy to remember and pronounce, which is great for branding.

Relevant: The "Itin" part immediately connects to "itinerary," which makes it clear that the website is about travel planning. The "next" part could imply "next destination," "next adventure," or even "the next step in planning your trip," which gives it a dynamic feel.

Modern and Techy: The name sounds modern, which is important for tech-focused services like a travel planning platform.

Unique: It's not overly common, so you’ll have a better chance at creating a distinct brand identity with it.





To Generate Attractions : npm run generate:attractions


🔑 Keys
Application ID
848469
Access Key
YEDIZjsDSSxJ3J26-jhfe26GvEdad2tdyE5vjE7jP1c
Secret key
kTu9Mx4F0k-PRVR0qK2KITBa0USTQrMht5Gef088Vf4
Note: both your Access Key and Secret Key must remain confidential.
Pixel API Key : sI2cHfVXTjfzvZ5EBUg7SUUa8NomHfpuLxhv8aQ7fgwelEJXZ1ghQNSE

Supabase Database Tables
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  destination_id text not null,
  destination_name text,
  author text not null,
  text text not null,
  rating int not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Allow anyone to read reviews
create policy "public read reviews"
on public.reviews for select
to anon
using (true);

-- Allow anyone to add a review (public demo mode)
create policy "public insert reviews"
on public.reviews for insert
to anon
with check (true);


// DO THIS STEP BEFORE SUBMISSION TO GOOGLE

5) Google steps (this is required)

Add itinex.com in Google Search Console

Verify ownership (DNS or HTML file)

Submit: https://itinex.com/sitemap.xml

“Request indexing” for the homepage



Deploy latest build :

az storage blob upload-batch \
  --account-name itinexstorageaccount \
  --destination '$web' \
  --source ./build \
  --auth-mode login \
  --overwrite

  NS LOOKUP : nslookup www.itinex.net



  TXT Record name : _dnsauth.itinex.net
  TXT Record Value : _j7sccknal26sfrll2pzbibd65gm4xsy


  Supabase - Attraction reactions 

  -- One row per attraction per trip
create table if not exists public.attraction_votes (
  id bigserial primary key,
  trip_id text not null,
  attraction_key text not null,
  attraction_name text not null,

  likes integer not null default 0,
  dislikes integer not null default 0,

  -- net score (likes - dislikes) -> matches your example 10 likes, 3 dislikes => 7
  -- BUT you said it should be 10, so we store "reactions" as likes - dislikes ONLY if you want net.
  reactions integer generated always as (likes - dislikes) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (trip_id, attraction_key)
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_attraction_votes_updated_at on public.attraction_votes;
create trigger trg_attraction_votes_updated_at
before update on public.attraction_votes
for each row execute function public.set_updated_at();

-- RPC: apply atomic deltas
create or replace function public.vote_attraction_delta(
  p_trip_id text,
  p_attraction_key text,
  p_attraction_name text,
  p_like_delta integer,
  p_dislike_delta integer
)
returns public.attraction_votes
language plpgsql
as $$
declare
  row public.attraction_votes;
begin
  -- ensure row exists
  insert into public.attraction_votes(trip_id, attraction_key, attraction_name, likes, dislikes)
  values (p_trip_id, p_attraction_key, p_attraction_name, 0, 0)
  on conflict (trip_id, attraction_key) do nothing;

  -- atomic update (clamp to >=0)
  update public.attraction_votes
  set
    attraction_name = p_attraction_name,
    likes = greatest(0, likes + p_like_delta),
    dislikes = greatest(0, dislikes + p_dislike_delta),
    updated_at = now()
  where trip_id = p_trip_id and attraction_key = p_attraction_key
  returning * into row;

  return row;
end;
$$;

-- RLS (open, since you have no auth)
alter table public.attraction_votes enable row level security;

drop policy if exists "public read attraction_votes" on public.attraction_votes;
create policy "public read attraction_votes"
on public.attraction_votes for select
using (true);

drop policy if exists "public insert attraction_votes" on public.attraction_votes;
create policy "public insert attraction_votes"
on public.attraction_votes for insert
with check (true);

drop policy if exists "public update attraction_votes" on public.attraction_votes;
create policy "public update attraction_votes"
on public.attraction_votes for update
using (true)
with check (true);


Append numbers based on likes and dislikes(descend)

- alter table public.attraction_votes
add constraint attraction_votes_unique unique (trip_id, attraction_key);

- create or replace function public.vote_attraction_delta(
  p_trip_id text,
  p_attraction_key text,
  p_attraction_name text,
  p_like_delta integer,
  p_dislike_delta integer
)
returns public.attraction_votes
language plpgsql
as $$
declare
  row public.attraction_votes;
begin
  -- Create the row if missing
  insert into public.attraction_votes(trip_id, attraction_key, attraction_name, likes, dislikes)
  values (p_trip_id, p_attraction_key, p_attraction_name, 0, 0)
  on conflict (trip_id, attraction_key) do nothing;

  -- Increment / decrement totals (clamped so it never goes negative)
  update public.attraction_votes
  set
    attraction_name = p_attraction_name,
    likes = greatest(0, likes + coalesce(p_like_delta, 0)),
    dislikes = greatest(0, dislikes + coalesce(p_dislike_delta, 0)),
    updated_at = now()
  where trip_id = p_trip_id and attraction_key = p_attraction_key
  returning * into row;

  return row;
end;
$$;


______
- You should see:

    - only one row per attraction_key per trip_id

    - counts increasing/decreasing


select trip_id, attraction_key, attraction_name, likes, dislikes, reactions
from public.attraction_votes
order by updated_at desc
limit 20;

____