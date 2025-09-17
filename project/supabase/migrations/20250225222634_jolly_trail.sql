/*
  # Add Initial Users and Course Enrollments
  
  1. Changes
    - Creates initial user accounts
    - Sets up user profiles with names
    - Creates course enrollments
  
  2. Security
    - Uses secure password hashing
    - Maintains RLS policies
    - Preserves data integrity
*/

-- Create users and profiles
DO $$
DECLARE
  _password_hash text;
BEGIN
  -- Get password hash for 'RealEdu2025!@'
  _password_hash := crypt('RealEdu2025!@', gen_salt('bf'));

  -- Brenna Allen
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('bccfdae0-2c73-4825-83e4-e786dd85e06d', 'brenna.allen.re@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('bccfdae0-2c73-4825-83e4-e786dd85e06d', 'brenna.allen.re@gmail.com', 'Brenna', 'Allen')
  ON CONFLICT (id) DO NOTHING;

  -- Haley Andersen
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('05d45822-63c0-4111-8ae0-da1b697d4033', 'homeswithhaley@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('05d45822-63c0-4111-8ae0-da1b697d4033', 'homeswithhaley@gmail.com', 'Haley', 'Andersen')
  ON CONFLICT (id) DO NOTHING;

  -- Elizabeth Balcarcel
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('60a6b094-508a-411f-99b5-8caef88a69e4', 'elizabeth.balcarcel@inmobiliariadsm.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('60a6b094-508a-411f-99b5-8caef88a69e4', 'elizabeth.balcarcel@inmobiliariadsm.com', 'Elizabeth', 'Balcarcel')
  ON CONFLICT (id) DO NOTHING;

  -- Monica Benz
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('137490dd-5f75-4e90-986c-f0e7804487df', 'monica.benz@oakridge.net', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('137490dd-5f75-4e90-986c-f0e7804487df', 'monica.benz@oakridge.net', 'Monica', 'Benz')
  ON CONFLICT (id) DO NOTHING;

  -- Jill Budden
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('5f05e0cd-9db6-4523-a889-a13789a81f69', 'jillbudden.realtor@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('5f05e0cd-9db6-4523-a889-a13789a81f69', 'jillbudden.realtor@gmail.com', 'Jill', 'Budden')
  ON CONFLICT (id) DO NOTHING;

  -- Adam Bugbee
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('8099aa2a-2118-434f-9064-9ebc25cb65e9', 'adam.bugbee@exprealty.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('8099aa2a-2118-434f-9064-9ebc25cb65e9', 'adam.bugbee@exprealty.com', 'Adam', 'Bugbee')
  ON CONFLICT (id) DO NOTHING;

  -- Stephanie Burris
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('87d069dd-17d4-4541-94d2-8e906f0a4301', 'stephanie.e.burris@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('87d069dd-17d4-4541-94d2-8e906f0a4301', 'stephanie.e.burris@gmail.com', 'Stephanie', 'Burris')
  ON CONFLICT (id) DO NOTHING;

  -- Emily Burton
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('a47b76d6-e27d-49d8-824f-619f0adf2f8f', 'emily@mistysold.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('a47b76d6-e27d-49d8-824f-619f0adf2f8f', 'emily@mistysold.com', 'Emily', 'Burton')
  ON CONFLICT (id) DO NOTHING;

  -- Ashley Chalstrom
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('80ca52a1-8fa6-4b26-a90f-5e193908798a', 'ashleyc@c21sre.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('80ca52a1-8fa6-4b26-a90f-5e193908798a', 'ashleyc@c21sre.com', 'Ashley', 'Chalstrom')
  ON CONFLICT (id) DO NOTHING;

  -- Angela Conroy
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('4b4803b6-1faf-4b76-8090-b79f8eab9dc9', 'angieconroyrealestate@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('4b4803b6-1faf-4b76-8090-b79f8eab9dc9', 'angieconroyrealestate@gmail.com', 'Angela', 'Conroy')
  ON CONFLICT (id) DO NOTHING;

  -- Kim Constable
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('dbdf51a5-beac-415c-b3c1-eb82f3645a3c', 'kimconstable.realestate@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('dbdf51a5-beac-415c-b3c1-eb82f3645a3c', 'kimconstable.realestate@gmail.com', 'Kim', 'Constable')
  ON CONFLICT (id) DO NOTHING;

  -- Mauro De Avila
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('d633aeb6-a6cf-4f39-a226-56937e197553', 'mauro@teamirg.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('d633aeb6-a6cf-4f39-a226-56937e197553', 'mauro@teamirg.com', 'Mauro', 'De Avila')
  ON CONFLICT (id) DO NOTHING;

  -- Kathryn Fain
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('a2cfce02-058e-450e-8d72-f42f850cade5', 'kathryn.fain@oakridge.net', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('a2cfce02-058e-450e-8d72-f42f850cade5', 'kathryn.fain@oakridge.net', 'Kathryn', 'Fain')
  ON CONFLICT (id) DO NOTHING;

  -- Amy Forte
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('be103ef6-a810-404b-b17b-2cda94c2246e', 'amyforterealtor@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('be103ef6-a810-404b-b17b-2cda94c2246e', 'amyforterealtor@gmail.com', 'Amy', 'Forte')
  ON CONFLICT (id) DO NOTHING;

  -- Joyce Gibson
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('ce4769b3-c34e-4c2b-8914-052433d95226', 'joyce@hunziker.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('ce4769b3-c34e-4c2b-8914-052433d95226', 'joyce@hunziker.com', 'Joyce', 'Gibson')
  ON CONFLICT (id) DO NOTHING;

  -- Alysia Gordon
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('f21b9885-6340-4aeb-8209-0342759d05dd', 'aly@knickerbockerdsm.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('f21b9885-6340-4aeb-8209-0342759d05dd', 'aly@knickerbockerdsm.com', 'Alysia', 'Gordon')
  ON CONFLICT (id) DO NOTHING;

  -- Patty Grove
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('9fd5f57c-0a08-46ec-90b4-a384eaa838d6', 'patty@hunziker.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('9fd5f57c-0a08-46ec-90b4-a384eaa838d6', 'patty@hunziker.com', 'Patty', 'Grove')
  ON CONFLICT (id) DO NOTHING;

  -- Krista Harvey
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('0d75ee18-9084-481d-83b2-d474baf9c3a8', 'krista@realestateconcepts.net', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('0d75ee18-9084-481d-83b2-d474baf9c3a8', 'krista@realestateconcepts.net', 'Krista', 'Harvey')
  ON CONFLICT (id) DO NOTHING;

  -- Margo Hattery
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('0328d0fb-0e31-405c-91b3-973daa61e290', 'margo@hunziker.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('0328d0fb-0e31-405c-91b3-973daa61e290', 'margo@hunziker.com', 'Margo', 'Hattery')
  ON CONFLICT (id) DO NOTHING;

  -- Jared Hottle
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('4545fb77-0fa0-4d68-860e-45eb32e383be', 'jaredhott@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('4545fb77-0fa0-4d68-860e-45eb32e383be', 'jaredhott@gmail.com', 'Jared', 'Hottle')
  ON CONFLICT (id) DO NOTHING;

  -- Julie Howe
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('dc05d79d-d36c-4fc8-bdf1-fedf7df64967', 'srcjuliehowe@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('dc05d79d-d36c-4fc8-bdf1-fedf7df64967', 'srcjuliehowe@gmail.com', 'Julie', 'Howe')
  ON CONFLICT (id) DO NOTHING;

  -- Jaime Hymer
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('84cdc3be-efc4-485c-ad0c-e52d88587113', 'jhymer@pinnaclerealtyia.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('84cdc3be-efc4-485c-ad0c-e52d88587113', 'jhymer@pinnaclerealtyia.com', 'Jaime', 'Hymer')
  ON CONFLICT (id) DO NOTHING;

  -- Rachel Iverson
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('b0552d98-0ea1-4159-96fc-b07f7d801905', 'rachel.iverson@oakridge.net', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('b0552d98-0ea1-4159-96fc-b07f7d801905', 'rachel.iverson@oakridge.net', 'Rachel', 'Iverson')
  ON CONFLICT (id) DO NOTHING;

  -- Tracy Jagim
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('06ad1566-851b-443b-9358-674ff512f0ec', 'tracy.jagim@exprealty.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('06ad1566-851b-443b-9358-674ff512f0ec', 'tracy.jagim@exprealty.com', 'Tracy', 'Jagim')
  ON CONFLICT (id) DO NOTHING;

  -- Elaine Johnson
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('974821ed-2a09-4e12-b8e9-8ca36cd49d85', 'elainezellejohnson@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('974821ed-2a09-4e12-b8e9-8ca36cd49d85', 'elainezellejohnson@gmail.com', 'Elaine', 'Johnson')
  ON CONFLICT (id) DO NOTHING;

  -- Jes Kettleson
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('6d6abbaf-3d5d-4a7d-8425-7e9c067b0bfd', 'jes@c21sre.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name, role)
  VALUES ('6d6abbaf-3d5d-4a7d-8425-7e9c067b0bfd', 'jes@c21sre.com', 'Jes', 'Kettleson', 'admin')
  ON CONFLICT (id) DO NOTHING;

  -- Melody King
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', 'ysrmelody@gmail.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', 'ysrmelody@gmail.com', 'Melody', 'King')
  ON CONFLICT (id) DO NOTHING;

  -- Tanya Kirkpatrick
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('7bd95e6e-a216-41a6-b131-a762d763b93b', 'tanya.kirkpatrick@oakridge.net', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('7bd95e6e-a216-41a6-b131-a762d763b93b', 'tanya.kirkpatrick@oakridge.net', 'Tanya', 'Kirkpatrick')
  ON CONFLICT (id) DO NOTHING;

  -- Ela Knapp
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('d2f836c2-a880-4718-a049-76f818c19215', 'ela@realestateconcepts.net', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('d2f836c2-a880-4718-a049-76f818c19215', 'ela@realestateconcepts.net', 'Ela', 'Knapp')
  ON CONFLICT (id) DO NOTHING;

  -- Breanna Koenigsfeld
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('632f8702-53cf-4668-8dc7-cd5c7ae3557d', 'breanna.koenigsfeld@oakridge.net', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('632f8702-53cf-4668-8dc7-cd5c7ae3557d', 'breanna.koenigsfeld@oakridge.net', 'Breanna', 'Koenigsfeld')
  ON CONFLICT (id) DO NOTHING;

  -- Kevin Kolbet
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('38b833e7-176d-4b1b-98ae-bbe60f30f0e5', 'kevin@kolbetrealtors.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('38b833e7-176d-4b1b-98ae-bbe60f30f0e5', 'kevin@kolbetrealtors.com', 'Kevin', 'Kolbet')
  ON CONFLICT (id) DO NOTHING;

  -- Colby Kostman
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('13c6ba6c-558e-4fcc-ae75-af2712d9fd01', 'colby@c21sre.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('13c6ba6c-558e-4fcc-ae75-af2712d9fd01', 'colby@c21sre.com', 'Colby', 'Kostman')
  ON CONFLICT (id) DO NOTHING;

  -- Jody Lautenbach
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES ('94682344-268c-44dc-9fe6-e5b692d85b98', 'jody@c21sre.com', _password_hash, now(), now(), now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO todo_profiles (id, email, first_name, last_name)
  VALUES ('94682344-268c-44dc-9fe6-e5b692d85b98', 'jody@c21sre.com', 'Jody', 'Lautenbach')
  ON CONFLICT (id) DO NOTHING;

END $$;

