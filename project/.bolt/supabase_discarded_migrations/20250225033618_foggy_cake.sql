/*
  # Import Users and Course Enrollments

  1. Changes
    - Create auth.users accounts for all users
    - Create todo_profiles with names
    - Create course enrollments
  
  2. Security
    - Sets secure password for all users
    - Maintains data consistency
    - Preserves enrollment timestamps
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

-- Create enrollments
INSERT INTO enrollments (user_id, course_id, enrolled_at)
VALUES
  -- Brenna Allen
  ('bccfdae0-2c73-4825-83e4-e786dd85e06d', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-02-10 16:23:52.717642+00'),
  
  -- Haley Andersen
  ('05d45822-63c0-4111-8ae0-da1b697d4033', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 18:14:15.061051+00'),
  
  -- Elizabeth Balcarcel
  ('60a6b094-508a-411f-99b5-8caef88a69e4', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-13 17:07:57.830933+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-13 17:08:47.149111+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', '390b461a-2cf8-4443-be17-73091e8b6923', '2025-01-13 17:10:12.110832+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', 'ffa6a432-3688-45b1-8c69-547b9ec86963', '2025-01-13 17:09:03.941575+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', '2a4b99c8-a6f4-4895-8b8f-3b7a9886eb00', '2025-01-13 17:09:41.439955+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', '90d32aee-638d-48c8-aa51-5639ca64a58d', '2025-01-13 17:10:46.104853+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', 'bf600604-1bde-48b1-85db-3088809fea1f', '2025-01-13 17:11:10.572428+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', 'fff9f800-c1f0-446c-bf0c-8e8d0e152fd7', '2025-01-13 17:11:35.391774+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', '76a7bba4-5d23-4b40-bc15-c5dbbe379652', '2025-01-13 17:12:04.11345+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', 'eb7e69dd-c973-43cf-9a86-6c49093c5c6e', '2025-01-13 17:12:29.64857+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', '97d118b9-6e85-463f-9ea5-33ef86a372cf', '2025-01-13 17:12:55.807799+00'),
  ('60a6b094-508a-411f-99b5-8caef88a69e4', '2b2f0a50-0195-44d2-9e8c-d1ffd936df46', '2025-01-13 17:13:09.974797+00'),

  -- Monica Benz
  ('137490dd-5f75-4e90-986c-f0e7804487df', '390b461a-2cf8-4443-be17-73091e8b6923', '2025-02-18 22:17:06.252273+00'),
  ('137490dd-5f75-4e90-986c-f0e7804487df', 'ffa6a432-3688-45b1-8c69-547b9ec86963', '2025-02-18 22:17:30.14284+00'),
  ('137490dd-5f75-4e90-986c-f0e7804487df', '2a4b99c8-a6f4-4895-8b8f-3b7a9886eb00', '2025-02-18 22:17:41.614155+00'),
  ('137490dd-5f75-4e90-986c-f0e7804487df', '90d32aee-638d-48c8-aa51-5639ca64a58d', '2025-02-18 22:17:43.040495+00'),
  ('137490dd-5f75-4e90-986c-f0e7804487df', 'bf600604-1bde-48b1-85db-3088809fea1f', '2025-02-18 22:17:46.532747+00'),
  ('137490dd-5f75-4e90-986c-f0e7804487df', 'fff9f800-c1f0-446c-bf0c-8e8d0e152fd7', '2025-02-18 22:17:48.320059+00'),
  ('137490dd-5f75-4e90-986c-f0e7804487df', '76a7bba4-5d23-4b40-bc15-c5dbbe379652', '2025-02-18 22:17:50.160205+00'),
  ('137490dd-5f75-4e90-986c-f0e7804487df', 'eb7e69dd-c973-43cf-9a86-6c49093c5c6e', '2025-02-18 22:17:53.139783+00'),
  ('137490dd-5f75-4e90-986c-f0e7804487df', '97d118b9-6e85-463f-9ea5-33ef86a372cf', '2025 b-6e85-463f-9ea5-33ef86a372cf', '2025-02-18 22:17:55.946801+00'),
  ('137490dd-5f75-4e90-986c-f0e7804487df', '2b2f0a50-0195-44d2-9e8c-d1ffd936df46', '2025-02-18 22:18:00.660474+00'),

  -- Jill Budden
  ('5f05e0cd-9db6-4523-a889-a13789a81f69', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 04:49:37.169091+00'),

  -- Adam Bugbee
  ('8099aa2a-2118-434f-9064-9ebc25cb65e9', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-13 00:07:25.688916+00'),
  ('8099aa2a-2118-434f-9064-9ebc25cb65e9', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-02-06 17:34:13.893325+00'),
  ('8099aa2a-2118-434f-9064-9ebc25cb65e9', '390b461a-2cf8-4443-be17-73091e8b6923', '2025-02-06 17:35:50.049855+00'),

  -- Stephanie Burris
  ('87d069dd-17d4-4541-94d2-8e906f0a4301', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 04:02:23.247004+00'),

  -- Emily Burton
  ('a47b76d6-e27d-49d8-824f-619f0adf2f8f', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 15:56:06.413736+00'),

  -- Ashley Chalstrom
  ('80ca52a1-8fa6-4b26-a90f-5e193908798a', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 18:05:12.773614+00'),

  -- Angela Conroy
  ('4b4803b6-1faf-4b76-8090-b79f8eab9dc9', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-02-08 03:13:44.563552+00'),
  ('4b4803b6-1faf-4b76-8090-b79f8eab9dc9', 'ffa6a432-3688-45b1-8c69-547b9ec86963', '2025-02-08 03:57:10.215319+00'),

  -- Kim Constable
  ('dbdf51a5-beac-415c-b3c1-eb82f3645a3c', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-29 15:48:33.195426+00'),
  ('dbdf51a5-beac-415c-b3c1-eb82f3645a3c', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-29 15:47:50.660973+00'),

  -- Mauro De Avila
  ('d633aeb6-a6cf-4f39-a226-56937e197553', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-08 19:18:32.447343+00'),

  -- Kathryn Fain
  ('a2cfce02-058e-450e-8d72-f42f850cade5', '390b461a-2cf8-4443-be17-73091e8b6923', '2025-02-13 04:26:41.125958+00'),
  ('a2cfce02-058e-450e-8d72-f42f850cade5', 'ffa6a432-3688-45b1-8c69-547b9ec86963', '2025-02-13 04:26:57.711667+00'),
  ('a2cfce02-058e-450e-8d72-f42f850cade5', '2a4b99c8-a6f4-4895-8b8f-3b7a9886eb00', '2025-02-13 04:27:13.665854+00'),
  ('a2cfce02-058e-450e-8d72-f42f850cade5', '90d32aee-638d-48c8-aa51-5639ca64a58d', '2025-02-13 04:27:25.669168+00'),
  ('a2cfce02-058e-450e-8d72-f42f850cade5', 'bf600604-1bde-48b1-85db-3088809fea1f', '2025-02-13 04:27:28.022112+00'),
  ('a2cfce02-058e-450e-8d72-f42f850cade5', 'fff9f800-c1f0-446c-bf0c-8e8d0e152fd7', '2025-02-13 04:27:31.807205+00'),
  ('a2cfce02-058e-450e-8d72-f42f850cade5', '76a7bba4-5d23-4b40-bc15-c5dbbe379652', '2025-02-13 04:27:35.010331+00'),
  ('a2cfce02-058e-450e-8d72-f42f850cade5', 'eb7e69dd-c973-43cf-9a86-6c49093c5c6e', '2025-02-13 04:27:37.850603+00'),
  ('a2cfce02-058e-450e-8d72-f42f850cade5', '97d118b9-6e85-463f-9ea5-33ef86a372cf', '2025-02-13 04:27:40.475337+00'),
  ('a2cfce02-058e-450e-8d72-f42f850cade5', '2b2f0a50-0195-44d2-9e8c-d1ffd936df46', '2025-02-13 04:27:43.090951+00'),

  -- Amy Forte
  ('be103ef6-a810-404b-b17b-2cda94c2246e', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-28 11:25:26.077339+00'),
  ('be103ef6-a810-404b-b17b-2cda94c2246e', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 11:25:23.229703+00'),
  ('be103ef6-a810-404b-b17b-2cda94c2246e', 'ffa6a432-3688-45b1-8c69-547b9ec86963', '2025-02-02 16:29:51.628683+00'),
  ('be103ef6-a810-404b-b17b-2cda94c2246e', 'bf600604-1bde-48b1-85db-3088809fea1f', '2025-02-02 16:26:52.402753+00'),

  -- Joyce Gibson
  ('ce4769b3-c34e-4c2b-8914-052433d95226', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-08 22:28:21.459694+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-08 22:28:51.317618+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', '390b461a-2cf8-4443-be17-73091e8b6923', '2025-01-08 22:28:59.360856+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', 'ffa6a432-3688-45b1-8c69-547b9ec86963', '2025-01-08 22:29:02.313042+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', '2a4b99c8-a6f4-4895-8b8f-3b7a9886eb00', '2025-01-08 22:29:08.617411+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', '90d32aee-638d-48c8-aa51-5639ca64a58d', '2025-01-08 22:29:12.13594+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', 'bf600604-1bde-48b1-85db-3088809fea1f', '2025-01-08 22:29:15.385129+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', 'fff9f800-c1f0-446c-bf0c-8e8d0e152fd7', '2025-01-08 22:29:18.725476+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', '76a7bba4-5d23-4b40-bc15-c5dbbe379652', '2025-01-08 22:29:21.735623+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', 'eb7e69dd-c973-43cf-9a86-6c49093c5c6e', '2025-01-08 22:29:26.028099+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', '97d118b9-6e85-463f-9ea5-33ef86a372cf', '2025-01-08 22:29:28.967675+00'),
  ('ce4769b3-c34e-4c2b-8914-052433d95226', '2b2f0a50-0195-44d2-9e8c-d1ffd936df46', '2025-01-08 22:29:32.212209+00'),

  -- Alysia Gordon
  ('f21b9885-6340-4aeb-8209-0342759d05dd', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-10 22:48:58.311266+00'),

  -- Patty Grove
  ('9fd5f57c-0a08-46ec-90b4-a384eaa838d6', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 17:54:13.191101+00'),

  -- Krista Harvey
  ('0d75ee18-9084-481d-83b2-d474baf9c3a8', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-07 23:59:43.956005+00'),

  -- Margo Hattery
  ('0328d0fb-0e31-405c-91b3-973daa61e290', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-13 18:23:12.2408+00'),
  ('0328d0fb-0e31-405c-91b3-973daa61e290', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-13 18:54:30.65318+00'),
  ('0328d0fb-0e31-405c-91b3-973daa61e290', '390b461a-2cf8-4443-be17-73091e8b6923', '2025-01-13 18:26:29.19906+00'),
  ('0328d0fb-0e31-405c-91b3-973daa61e290', 'ffa6a432-3688-45b1-8c69-547b9ec86963', '2025-01-13 18:56:22.987519+00'),

  -- Jared Hottle
  ('4545fb77-0fa0-4d68-860e-45eb32e383be', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-13 16:56:21.541462+00'),

  -- Julie Howe
  ('dc05d79d-d36c-4fc8-bdf1-fedf7df64967', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 18:43:42.055858+00'),

  -- Jaime Hymer
  ('84cdc3be-efc4-485c-ad0c-e52d88587113', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-08 01:40:13.27658+00'),

  -- Rachel Iverson
  ('b0552d98-0ea1-4159-96fc-b07f7d801905', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 13:03:36.308696+00'),

  -- Tracy Jagim
  ('06ad1566-851b-443b-9358-674ff512f0ec', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-12 21:35:43.40053+00'),
  ('06ad1566-851b-443b-9358-674ff512f0ec', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-12 21:36:02.220729+00'),

  -- Elaine Johnson
  ('974821ed-2a09-4e12-b8e9-8ca36cd49d85', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-30 21:47:24.020662+00'),

  -- Jes Kettleson
  ('6d6abbaf-3d5d-4a7d-8425-7e9c067b0bfd', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-07 23:31:51.515587+00'),

  -- Melody King
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 15:05:18.831927+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', '390b461a-2cf8-4443-be17-73091e8b6923', '2025-01-28 15:15:17.46015+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', 'ffa6a432-3688-45b1-8c69-547b9ec86963', '2025-01-28 15:16:22.140808+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', '2a4b99c8-a6f4-4895-8b8f-3b7a9886eb00', '2025-01-28 15:17:28.995194+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', '90d32aee-638d-48c8-aa51-5639ca64a58d', '2025-01-28 15:18:28.224138+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', 'bf600604-1bde-48b1-85db-3088809fea1f', '2025-01-28 15:19:14.084041+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', 'fff9f800-c1f0-446c-bf0c-8e8d0e152fd7', '2025-01-28 15:19:58.648136+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', '76a7bba4-5d23-4b40-bc15-c5dbbe379652', '2025-01-28 15:24:44.685333+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', 'eb7e69dd-c973-43cf-9a86-6c49093c5c6e', '2025-01-28 15:26:10.051986+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', '97d118b9-6e85-463f-9ea5-33ef86a372cf', '2025-01-28 15:27:04.665992+00'),
  ('68b8b968-61b5-40d8-a229-cb8b4fb0eb67', '2b2f0a50-0195-44d2-9e8c-d1ffd936df46', '2025-01-28 15:28:15.199692+00'),

  -- Tanya Kirkpatrick
  ('7bd95e6e-a216-41a6-b131-a762d763b93b', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-13 16:23:30.686403+00'),
  ('7bd95e6e-a216-41a6-b131-a762d763b93b', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 14:48:01.087721+00'),

  -- Ela Knapp
  ('d2f836c2-a880-4718-a049-76f818c19215', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 13:40:58.564215+00'),

  -- Breanna Koenigsfeld
  ('632f8702-53cf-4668-8dc7-cd5c7ae3557d', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-02-10 15:24:14.497177+00'),

  -- Kevin Kolbet
  ('38b833e7-176d-4b1b-98ae-bbe60f30f0e5', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-13 17:49:11.333592+00'),

  -- Colby Kostman
  ('13c6ba6c-558e-4fcc-ae75-af2712d9fd01', '9f3e4275-1587-4840-9e34-b1c135288b56', '2025-01-11 15:41:08.229254+00'),
  ('13c6ba6c-558e-4fcc-ae75-af2712d9fd01', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-11 15:42:28.066212+00'),
  ('13c6ba6c-558e-4fcc-ae75-af2712d9fd01', '390b461a-2cf8-4443-be17-73091e8b6923', '2025-01-11 15:42:56.900113+00'),

  -- Jody Lautenbach
  ('94682344-268c-44dc-9fe6-e5b692d85b98', '9684762f-ff03-46ce-85f8-fcdeac5e58b7', '2025-01-28 21:43:11.197013+00'),
  ('94682344-268c-44dc-9fe6-e5b692d85b98', '390b461a-2cf8-4443-be17-73091e8b6923', '2025-01-28 21:46:50.358967+00'),
  ('94682344-268c-44dc-9fe6-e5b692d85b98', '90d32aee-638d-48c8-aa51-5639ca64a58d', '2025-01-28 21:50:49.934707+00')
ON CONFLICT (user_id, course_id) DO NOTHING;