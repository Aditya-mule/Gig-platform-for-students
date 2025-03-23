export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-8" id="about">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-water text-blue-300 text-xl"></i>
              <h2 className="font-poppins font-bold text-xl">Ocean of Gigs</h2>
            </div>
            <p className="max-w-xs text-gray-300">
              Connecting talented college students with opportunities to grow their skills and portfolios.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-poppins font-semibold mb-3">Platform</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#how-it-works" className="hover:text-white transition">How it works</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-poppins font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-poppins font-semibold mb-3">Legal</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Ocean of Gigs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
