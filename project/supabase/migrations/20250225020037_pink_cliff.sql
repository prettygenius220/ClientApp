/*
  # Add Initial Course Data
  
  1. Changes
    - Inserts 10 real estate courses
    - Sets up virtual sessions with Google Meet links
    - Configures 1-hour duration for each course
    - Uses Unsplash images for course thumbnails
  
  2. Course Details
    - Each course has a unique course number
    - All courses are virtual with Google Meet integration
    - Sessions scheduled throughout 2025
    - Each session is 1 hour long
*/

-- Insert courses
INSERT INTO courses (
  course_number,
  title,
  description,
  image,
  price,
  instructor,
  duration,
  level,
  category,
  published,
  is_virtual,
  meet_link,
  start_time,
  end_time
) VALUES
  (
    '278-7010',
    'Acreage Adventures: Navigating Septics, Surveys and So Much More',
    'Master the complexities of rural property transactions. Learn essential knowledge about septic systems, property surveys, and unique considerations for acreage properties.',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Intermediate',
    'Rural Properties',
    true,
    true,
    'https://meet.google.com/ngq-wjhw-nnv?hs=122&authuser=1',
    '2025-03-10 12:00:00-05:00',
    '2025-03-10 13:00:00-05:00'
  ),
  (
    '278-7011',
    'Navigating the Web: Mastering Public Information Sites for Seamless Transactions',
    'Learn to efficiently use online public resources to gather property information, verify details, and streamline your real estate transactions.',
    'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Beginner',
    'Technology',
    true,
    true,
    'https://meet.google.com/eok-yuyu-vpj?hs=122&authuser=1',
    '2025-04-14 12:00:00-05:00',
    '2025-04-14 13:00:00-05:00'
  ),
  (
    '278-7012',
    'Decoding the Settlement Statement: A Guide to Fees and Client Clarity',
    'Understand the intricacies of settlement statements and learn how to explain complex fees to clients with confidence and clarity.',
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Intermediate',
    'Closing Process',
    true,
    true,
    'https://meet.google.com/ouy-jfzd-rki?hs=122&authuser=1',
    '2025-05-12 12:00:00-05:00',
    '2025-05-12 13:00:00-05:00'
  ),
  (
    '278-7015',
    'Abstract Essentials: Unlocking the Importance of Title Research',
    'Dive deep into title research fundamentals and learn how to identify and resolve common title issues before they become problems.',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Advanced',
    'Title Research',
    true,
    true,
    'https://meet.google.com/kbw-noas-fyf?hs=122&authuser=1',
    '2025-06-09 12:00:00-05:00',
    '2025-06-09 13:00:00-05:00'
  ),
  (
    '278-7016',
    'Signing Success: Navigating the Deed Package Docs and Signing',
    'Master the art of handling deed packages and learn best practices for smooth, error-free signing sessions.',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Intermediate',
    'Documentation',
    true,
    true,
    'https://meet.google.com/zwf-ohzf-rsn?hs=122&authuser=1',
    '2025-07-14 12:00:00-05:00',
    '2025-07-14 13:00:00-05:00'
  ),
  (
    '278-7017',
    'Closing Prep 101: Discover Hidden Issues Before Listing',
    'Learn proactive strategies to identify and address potential closing issues before they impact your transactions.',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Beginner',
    'Closing Process',
    true,
    true,
    'https://meet.google.com/vqc-tpnn-bez?hs=122&authuser=1',
    '2025-08-11 12:00:00-05:00',
    '2025-08-11 13:00:00-05:00'
  ),
  (
    '278-7018',
    'Title Troubles: Clearing Common Hurdles and Helping Clients Navigate Solutions',
    'Develop expertise in identifying and resolving common title issues while maintaining positive client relationships.',
    'https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Advanced',
    'Title Research',
    true,
    true,
    'https://meet.google.com/qda-mvui-ccs?hs=122&authuser=1',
    '2025-09-08 12:00:00-05:00',
    '2025-09-08 13:00:00-05:00'
  ),
  (
    '278-7019',
    'Contract Clarity: Essential Elements and Pitfalls in Real Estate Deals',
    'Master the key components of real estate contracts and learn to identify and avoid common contractual pitfalls.',
    'https://images.unsplash.com/photo-1542125387-c71274d94f0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Intermediate',
    'Contracts',
    true,
    true,
    'https://meet.google.com/xvh-uzuk-pkc?hs=122&authuser=1',
    '2025-10-06 12:00:00-05:00',
    '2025-10-06 13:00:00-05:00'
  ),
  (
    '278-7020',
    'Checklists to Success: The Ultimate Guide to Pre- and Post-Closing Essentials',
    'Develop comprehensive checklists and systems to ensure smooth closings and satisfied clients.',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Beginner',
    'Closing Process',
    true,
    true,
    'https://meet.google.com/ksy-jqmg-smi?hs=122&authuser=1',
    '2025-11-10 12:00:00-05:00',
    '2025-11-10 13:00:00-05:00'
  ),
  (
    '278-7021',
    'Closing Chronicles: A Deep Dive into Key Documents',
    'Gain in-depth understanding of essential closing documents and learn to explain them effectively to clients.',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    149.99,
    'Jes Kettleson',
    '1 hour',
    'Advanced',
    'Documentation',
    true,
    true,
    'https://meet.google.com/evw-oqjr-nbt?hs=122&authuser=1',
    '2025-12-08 12:00:00-05:00',
    '2025-12-08 13:00:00-05:00'
  );

-- Add comments
COMMENT ON TABLE courses IS 'Stores course information including virtual session details';