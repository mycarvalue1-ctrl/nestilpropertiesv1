export default function TermsOfServicePage() {
    return (
      <div className="bg-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto prose prose-lg text-foreground/90">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
                Terms of Service
              </h1>
               <p className="mt-2 text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
  
            <h2>1. Agreement to Terms</h2>
            <p>
              By using our website Nestil.in (the “Site”), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Site.
            </p>
  
            <h2>2. User Accounts</h2>
            <p>
              When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
  
            <h2>3. User Conduct</h2>
            <p>
              You agree not to use the Site to:
            </p>
            <ul>
              <li>Post any information that is false, inaccurate, or misleading.</li>
              <li>Violate any applicable laws or regulations.</li>
              <li>Infringe the rights of any third party, including intellectual property rights.</li>
              <li>Distribute spam, chain letters, or pyramid schemes.</li>
            </ul>
  
            <h2>4. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness. By posting Content on or through the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.
            </p>

            <h2>5. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
  
            <h2>6. Contact Us</h2>
             <p>
                If you have any questions about these Terms, please contact us at helpnestil@gmail.com.
            </p>
          </div>
        </div>
      </div>
    );
  }
