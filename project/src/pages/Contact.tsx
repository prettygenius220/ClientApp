import LeadForm from '../components/LeadForm';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Get in Touch
        </h1>
        <p className="text-xl text-gray-600">
          Have a question or interested in our services? Let us know!
        </p>
      </div>

      <LeadForm />
    </div>
  );
}