import { Link } from 'react-router-dom';

const navigation = {
  main: [
    { name: 'About', href: '/about' },
    { name: 'Courses', href: '/courses' },
    { name: 'Contact', href: '/contact' }
  ]
};

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <Link to={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
        
        <div className="mt-10 text-center">
          <div className="text-sm text-gray-500">
            <p>info@realedu.co</p>
            <p className="mt-2">
              4817 University Avenue,<br />
              Suite D, Cedar Falls,<br />
              Iowa 50613
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-xs leading-5 text-gray-500">
          &copy; {new Date().getFullYear()} RealEducation. All rights reserved.
        </p>
      </div>
    </footer>
  );
}