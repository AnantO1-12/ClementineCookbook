do $$
declare
  admin_user_id uuid;
begin
  select id
  into admin_user_id
  from auth.users
  order by created_at asc
  limit 1;

  if admin_user_id is null then
    raise exception 'Create your admin auth user first, then run supabase/seed.sql.';
  end if;

  insert into public.recipes (
    user_id,
    title,
    slug,
    description,
    category,
    cuisine,
    prep_time,
    cook_time,
    servings,
    ingredients,
    instructions,
    notes,
    image_url,
    is_favorite
  )
  values
    (
      admin_user_id,
      'Citrus Roast Chicken Bowl',
      'citrus-roast-chicken-bowl',
      'Roast chicken with saffron rice, shaved fennel, and a glossy orange pan sauce.',
      'Dinner',
      'Mediterranean',
      20,
      40,
      4,
      '["4 bone-in chicken thighs", "2 tbsp olive oil", "1 orange, zested and juiced", "1 tsp smoked paprika", "2 cups cooked saffron rice", "1 small fennel bulb, shaved thin", "1 handful mint leaves", "Sea salt and black pepper"]'::jsonb,
      '["Heat the oven to 425°F and season the chicken with olive oil, orange zest, paprika, salt, and pepper.", "Roast the chicken for 35 to 40 minutes until the skin is deep golden and the juices run clear.", "Warm the rice and toss the shaved fennel with orange juice, mint, and a pinch of salt.", "Serve the chicken over saffron rice, spoon the pan juices over the top, and finish with the fennel salad."]'::jsonb,
      'A spoonful of Greek yogurt softens the citrus nicely if you want a creamier finish.',
      'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=1200&q=80',
      true
    ),
    (
      admin_user_id,
      'Burnt Honey Ricotta Toast',
      'burnt-honey-ricotta-toast',
      'Thick toast layered with whipped ricotta, warm honey, and roasted apricots.',
      'Breakfast',
      'Italian-inspired',
      10,
      15,
      2,
      '["2 thick slices sourdough", "3/4 cup ricotta", "2 apricots, halved", "2 tbsp honey", "1 tbsp pistachios, chopped", "Flaky salt", "Black pepper"]'::jsonb,
      '["Toast the sourdough until crisp on the edges and still tender in the center.", "Roast the apricots at 400°F for about 12 minutes until they slump and caramelize.", "Whip the ricotta with a pinch of salt until smooth and airy.", "Spread ricotta over the toast, add roasted apricots, drizzle with warm honey, and finish with pistachios and black pepper."]'::jsonb,
      'If apricots are out of season, ripe peaches or figs work beautifully.',
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
      false
    ),
    (
      admin_user_id,
      'Spiced Tomato Lentil Soup',
      'spiced-tomato-lentil-soup',
      'A velvety weeknight soup with cumin, red lentils, and a swirl of lemony olive oil.',
      'Lunch',
      'Middle Eastern',
      15,
      30,
      4,
      '["2 tbsp olive oil", "1 yellow onion, diced", "3 cloves garlic, sliced", "1 tsp cumin", "1/2 tsp coriander", "1 cup red lentils", "1 can crushed tomatoes", "4 cups vegetable stock", "1 lemon", "Fresh parsley"]'::jsonb,
      '["Saute the onion and garlic in olive oil until soft and fragrant.", "Stir in the cumin and coriander, then add the lentils, tomatoes, and stock.", "Simmer for 25 to 30 minutes until the lentils collapse and the soup thickens.", "Blend until mostly smooth, season with lemon juice, and finish with parsley and olive oil."]'::jsonb,
      'Thin with a little extra stock the next day, since the lentils keep thickening in the fridge.',
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
      true
    )
  on conflict (slug) do update
  set
    user_id = excluded.user_id,
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    cuisine = excluded.cuisine,
    prep_time = excluded.prep_time,
    cook_time = excluded.cook_time,
    servings = excluded.servings,
    ingredients = excluded.ingredients,
    instructions = excluded.instructions,
    notes = excluded.notes,
    image_url = excluded.image_url,
    is_favorite = excluded.is_favorite,
    updated_at = timezone('utc', now());
end $$;
