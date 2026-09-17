import emailjs from '@emailjs/browser';

const getInitialConfig = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('sfhs_emailjs_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          serviceId: parsed.serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_9whclxh',
          templateId: parsed.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_bpnxfea',
          publicKey: parsed.publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'w7Cte7CcydMY36F8M',
        };
      }
    } catch (e) {}
  }
  return {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_9whclxh',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_bpnxfea',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'w7Cte7CcydMY36F8M'
  };
};

export const EMAILJS_CONFIG = getInitialConfig();

export const updateEmailJSConfig = (serviceId: string, templateId: string, publicKey: string) => {
  EMAILJS_CONFIG.serviceId = serviceId.trim();
  EMAILJS_CONFIG.templateId = templateId.trim();
  EMAILJS_CONFIG.publicKey = publicKey.trim();
  if (typeof window !== 'undefined') {
    localStorage.setItem('sfhs_emailjs_config', JSON.stringify(EMAILJS_CONFIG));
    try {
      emailjs.init(EMAILJS_CONFIG.publicKey);
    } catch (e) {}
  }
};

// Explicitly initialize EmailJS with the public key
try {
  if (typeof window !== 'undefined' && EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }
} catch (e) {
  console.warn('[EmailService] Initialization notice:', e);
}

export interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const emailService = {
  isConfigured(): boolean {
    return Boolean(EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.publicKey);
  },

  getConfig() {
    return { ...EMAILJS_CONFIG };
  },

  async sendTestEmail(toEmail: string): Promise<EmailResult> {
    const trimmed = toEmail.trim();
    if (!trimmed) return { success: false, error: 'Recipient email address is required.' };
    return this.sendBursarCredentialsEmail({
      full_name: 'School Administrator (Email Connection Test)',
      email: trimmed,
      password: 'password123'
    });
  },

  /**
   * Send onboarding credentials to Bursar upon registration or account update.
   */
  async sendBursarCredentialsEmail(params: {
    full_name: string;
    email: string;
    password?: string;
    phone?: string;
  }): Promise<EmailResult> {
    const toEmail = params.email.trim();
    if (!toEmail) {
      return { success: false, error: 'Recipient email address is required.' };
    }

    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://solid-foundation-high-school.vercel.app/login';
    const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login?role=bursar` : `${portalUrl}?role=bursar`;
    const password = params.password || 'password123';

    const templateParams = {
      // Recipient email aliases to match any EmailJS template configuration
      to_email: toEmail,
      email: toEmail,
      user_email: toEmail,
      recipient_email: toEmail,
      recipient: toEmail,
      to: toEmail,

      // Sender & subject
      from_name: 'Solid Foundation Comprehensive High School',
      reply_to: 'bursary@solidfoundationhigh.edu.ng',
      subject: 'Official Bursar Account Provisioning & Login Credentials',

      // Recipient name aliases
      to_name: params.full_name.trim(),
      name: params.full_name.trim(),
      parent_name: params.full_name.trim(), // fallback if template expects parent_name
      bursar_name: params.full_name.trim(),

      // Role & credentials
      role: 'Head Bursar / Bursary Officer',
      default_password: password,
      password: password,

      // Portal URLs
      portal_url: portalUrl,
      login_url: loginUrl,

      // Context identifiers
      student_name: 'Solid Foundation HS Bursary Administration Account',
      admission_no: 'STAFF-BURSAR-01',

      // General message body
      message: `Dear ${params.full_name.trim()},\n\nYour official Solid Foundation Comprehensive High School Bursar portal account has been provisioned.\n\nPortal Login Email: ${toEmail}\nPassword: ${password}\nAccess Link: ${loginUrl}\n\nPlease keep your credentials secure.`
    };

    try {
      console.log('[EmailService] Dispatching Bursar registration email to:', toEmail);
      const res = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );
      console.log('[EmailService] Bursar email dispatched successfully:', res.status, res.text);
      return { success: true, message: `Official credentials email delivered to ${toEmail}` };
    } catch (err: any) {
      console.warn('[EmailService] Failed to dispatch Bursar credentials email:', err);
      return { 
        success: false, 
        error: err?.text || err?.message || 'Email dispatch failed. Please verify recipient email or check EmailJS status.' 
      };
    }
  },

  /**
   * Send welcome email to parent when a new student is admitted/registered.
   */
  async sendStudentWelcomeEmail(params: {
    guardian_name: string;
    guardian_email: string;
    student_name: string;
    admission_no: string;
    default_password?: string;
  }): Promise<EmailResult> {
    const toEmail = params.guardian_email.trim();
    if (!toEmail) {
      return { success: false, error: 'Guardian email address is required.' };
    }

    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://solid-foundation-high-school.vercel.app/login';
    const password = params.default_password || 'parent123';

    const templateParams = {
      to_email: toEmail,
      email: toEmail,
      user_email: toEmail,
      recipient_email: toEmail,
      recipient: toEmail,
      to: toEmail,

      from_name: 'Solid Foundation Comprehensive High School',
      reply_to: 'bursary@solidfoundationhigh.edu.ng',
      subject: `Welcome to Solid Foundation High School - Student Admission Credentials`,

      to_name: params.guardian_name.trim(),
      name: params.guardian_name.trim(),
      parent_name: params.guardian_name.trim(),

      student_name: params.student_name.trim(),
      admission_no: params.admission_no.trim(),

      default_password: password,
      password: password,

      portal_url: portalUrl,
      login_url: portalUrl,

      message: `Welcome to Solid Foundation Comprehensive High School! Your parent portal account has been activated for ward ${params.student_name} (${params.admission_no}). Portal Login: ${toEmail} | Password: ${password}. Access portal: ${portalUrl}`
    };

    try {
      console.log('[EmailService] Dispatching Student Registration welcome email to:', toEmail);
      const res = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );
      console.log('[EmailService] Student welcome email dispatched successfully:', res.status, res.text);
      return { success: true, message: `Welcome email sent to ${toEmail}` };
    } catch (err: any) {
      console.warn('[EmailService] Student welcome email dispatch failed:', err);
      return { 
        success: false, 
        error: err?.text || err?.message || 'Email dispatch failed.' 
      };
    }
  },

  /**
   * Send welcome email when a guardian is added in Guardian directory.
   */
  async sendGuardianWelcomeEmail(params: {
    guardian_name: string;
    guardian_email: string;
    phone?: string;
    default_password?: string;
  }): Promise<EmailResult> {
    const toEmail = params.guardian_email.trim();
    if (!toEmail) {
      return { success: false, error: 'Guardian email address is required.' };
    }

    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://solid-foundation-high-school.vercel.app/login';
    const password = params.default_password || 'parent123';

    const templateParams = {
      to_email: toEmail,
      email: toEmail,
      user_email: toEmail,
      recipient_email: toEmail,
      recipient: toEmail,
      to: toEmail,

      from_name: 'Solid Foundation Comprehensive High School',
      reply_to: 'bursary@solidfoundationhigh.edu.ng',
      subject: `Parent Portal Access Credentials - Solid Foundation High School`,

      to_name: params.guardian_name.trim(),
      name: params.guardian_name.trim(),
      parent_name: params.guardian_name.trim(),

      student_name: 'Enrolled Ward(s) at SFCHS',
      admission_no: 'Bursary Verified',

      default_password: password,
      password: password,

      portal_url: portalUrl,
      login_url: portalUrl,

      message: `Dear ${params.guardian_name.trim()}, your parent portal account for Solid Foundation Comprehensive High School is now active. Login: ${toEmail} | Password: ${password}. Access: ${portalUrl}`
    };

    try {
      console.log('[EmailService] Dispatching Guardian welcome email to:', toEmail);
      const res = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );
      console.log('[EmailService] Guardian welcome email sent:', res.status, res.text);
      return { success: true, message: `Welcome email sent to ${toEmail}` };
    } catch (err: any) {
      console.warn('[EmailService] Guardian welcome email failed:', err);
      return { 
        success: false, 
        error: err?.text || err?.message || 'Email dispatch failed.' 
      };
    }
  }
};
