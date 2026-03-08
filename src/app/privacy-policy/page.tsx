export default function PrivacyPolicyPage() {
    return (
      <div className="bg-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto prose prose-lg text-foreground/90">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
                Privacy Policy
              </h1>
              <p className="mt-2 text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
  
            <p>
              Welcome to Nestil ("we," "us," or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website Nestil.in. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
  
            <h2>Collection of Your Information</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            <ul>
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as posting a property.
              </li>
              <li>
                <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
              </li>
              <li>
                <strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase credits or other services from us. We store only very limited, if any, financial information that we collect.
              </li>
            </ul>
  
            <h2>Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Email you regarding your account or order.</li>
              <li>Enable user-to-user communications.</li>
              <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
              <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
            </ul>
  
            <h2>Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <ul>
              <li>
                <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
              </li>
              <li>
                <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, and marketing assistance.
              </li>
            </ul>

            <h2>Contact Us</h2>
            <p>
                If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p>
                Nestil Support<br/>
                Vijayawada, Andhra Pradesh<br/>
                helpnestil@gmail.com
            </p>
          </div>
        </div>
      </div>
    );
  }
