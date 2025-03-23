import { Link } from "wouter";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import UserTypeButton from "@/components/ui/UserTypeButton";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="flex-grow flex flex-col md:flex-row items-center container mx-auto px-4 py-12 md:py-20">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl text-blue-900 mb-4">Connect, Collaborate, Create</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-lg">The premier marketplace connecting college students with skills to startups and peers who need them.</p>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-poppins font-semibold text-xl mb-4 text-center">I am a...</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <UserTypeButton
                userType="student"
                icon={<i className="fas fa-user-graduate"></i>}
                title="Student / Freelancer"
                description="Find gigs & showcase skills"
                className="bg-blue-500 hover:bg-blue-700"
              />
              
              <UserTypeButton
                userType="recruiter"
                icon={<i className="fas fa-briefcase"></i>}
                title="Recruiter"
                description="Post gigs & find talent"
                className="bg-amber-500 hover:bg-amber-600"
              />
            </div>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
            alt="College students collaborating" 
            className="rounded-lg shadow-lg max-w-full h-auto"
            width="600"
            height="400"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="font-poppins font-bold text-3xl text-center text-blue-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Students */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-circle text-2xl text-blue-900"></i>
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-3">For Students</h3>
              <ul className="text-gray-600 text-left space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check text-teal-600 mt-1 mr-2"></i>
                  <span>Create a profile showcasing your skills & experience</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-teal-600 mt-1 mr-2"></i>
                  <span>Browse and apply to gigs matching your abilities</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-teal-600 mt-1 mr-2"></i>
                  <span>Build portfolio and gain real-world experience</span>
                </li>
              </ul>
            </div>
            
            {/* For Recruiters */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-building text-2xl text-amber-600"></i>
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-3">For Recruiters</h3>
              <ul className="text-gray-600 text-left space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check text-teal-600 mt-1 mr-2"></i>
                  <span>Post gigs with detailed requirements</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-teal-600 mt-1 mr-2"></i>
                  <span>Browse student profiles filtered by skills</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-teal-600 mt-1 mr-2"></i>
                  <span>Contact talented students directly for your projects</span>
                </li>
              </ul>
            </div>
            
            {/* Success Stories */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-2xl text-blue-900"></i>
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-3">Success Stories</h3>
              <div className="text-gray-600">
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="italic">"Found my first design client and built my portfolio!"</p>
                  <p className="font-semibold mt-2">- Alex, Graphic Design Major</p>
                </div>
                <div>
                  <p className="italic">"Hired 3 talented students who helped launch our MVP."</p>
                  <p className="font-semibold mt-2">- TechStart, Campus Startup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
