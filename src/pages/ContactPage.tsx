import { ContactForm } from '../components/ContactForm';

export const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Fale Conosco
          </h1>
          <p className="text-gray-600">
            Estamos aqui para ajudar. Envie sua mensagem e retornaremos em breve.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
};
