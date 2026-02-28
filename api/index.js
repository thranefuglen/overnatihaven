"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/handler.ts
var handler_exports = {};
__export(handler_exports, {
  default: () => handler
});
module.exports = __toCommonJS(handler_exports);
var import_express5 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));

// server/routes/inquiryRoutes.ts
var import_express = require("express");

// server/db/database.postgres.ts
var import_postgres = require("@vercel/postgres");
async function query(text, params = []) {
  try {
    const result = await import_postgres.sql.query(text, params);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}
async function queryOne(text, params = []) {
  try {
    const result = await import_postgres.sql.query(text, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Database queryOne error:", error);
    throw error;
  }
}
async function execute(text, params = []) {
  try {
    const result = await import_postgres.sql.query(text, params);
    const insertId = result.rows[0]?.id;
    return {
      rowCount: result.rowCount || 0,
      insertId
    };
  } catch (error) {
    console.error("Database execute error:", error);
    throw error;
  }
}

// server/repositories/inquiryRepository.ts
var InquiryRepository = class {
  /**
   * Create a new inquiry
   */
  async create(data) {
    const result = await queryOne(
      `INSERT INTO inquiries (name, email, phone, arrival_date, departure_date, num_people, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        data.name,
        data.email,
        data.phone || null,
        data.arrivalDate,
        data.departureDate,
        data.numPeople,
        data.message || null
      ]
    );
    if (!result) {
      throw new Error("Failed to create inquiry");
    }
    return await this.findById(result.id);
  }
  /**
   * Find inquiry by ID
   */
  async findById(id) {
    const row = await queryOne("SELECT * FROM inquiries WHERE id = $1", [id]);
    return row || void 0;
  }
  /**
   * Get all inquiries with optional filtering
   */
  async findAll(filters) {
    let queryText = "SELECT * FROM inquiries";
    const params = [];
    let paramIndex = 1;
    if (filters?.status) {
      queryText += ` WHERE status = $${paramIndex++}`;
      params.push(filters.status);
    }
    queryText += " ORDER BY created_at DESC";
    if (filters?.limit) {
      queryText += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }
    const rows = await query(queryText, params);
    return rows;
  }
  /**
   * Update inquiry status
   */
  async updateStatus(id, status) {
    const result = await execute(
      `UPDATE inquiries
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, id]
    );
    return result.rowCount > 0;
  }
  /**
   * Delete inquiry
   */
  async delete(id) {
    const result = await execute("DELETE FROM inquiries WHERE id = $1", [id]);
    return result.rowCount > 0;
  }
  /**
   * Check for overlapping bookings
   */
  async hasOverlap(arrivalDate, departureDate, excludeId) {
    let queryText = `
      SELECT COUNT(*) as count
      FROM inquiries
      WHERE status IN ('confirmed', 'pending')
      AND (
        (arrival_date <= $1 AND departure_date > $2)
        OR (arrival_date < $3 AND departure_date >= $4)
        OR (arrival_date >= $5 AND departure_date <= $6)
      )
    `;
    const params = [
      arrivalDate,
      arrivalDate,
      departureDate,
      departureDate,
      arrivalDate,
      departureDate
    ];
    let paramIndex = 7;
    if (excludeId) {
      queryText += ` AND id != $${paramIndex}`;
      params.push(excludeId);
    }
    const row = await queryOne(queryText, params);
    return parseInt(row?.count || "0") > 0;
  }
};
var inquiryRepository = new InquiryRepository();

// server/services/emailService.ts
var import_nodemailer = __toESM(require("nodemailer"));

// server/config/env.ts
var import_dotenv = __toESM(require("dotenv"));
import_dotenv.default.config();
var config = {
  // Server
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  // Database
  database: {
    path: process.env.DB_PATH || "./data/overnatihaven.db"
  },
  // Email
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "",
    to: process.env.EMAIL_TO || ""
  },
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10", 10)
  },
  // JWT
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
    // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/jpg,image/png,image/webp").split(",")
  },
  // Vercel Blob Storage
  blob: {
    readWriteToken: process.env.BLOB_READ_WRITE_TOKEN || ""
  }
};
var isDevelopment = config.nodeEnv === "development";
var isProduction = config.nodeEnv === "production";

// server/config/logger.ts
var import_winston = __toESM(require("winston"));
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var logFormat = import_winston.default.format.combine(
  import_winston.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  import_winston.default.format.errors({ stack: true }),
  import_winston.default.format.splat(),
  import_winston.default.format.json()
);
var consoleFormat = import_winston.default.format.combine(
  import_winston.default.format.colorize(),
  import_winston.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  import_winston.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);
var transports = [
  new import_winston.default.transports.Console({ format: consoleFormat })
];
if (isDevelopment) {
  const logsDir = import_path.default.join(process.cwd(), "logs");
  if (!import_fs.default.existsSync(logsDir)) {
    import_fs.default.mkdirSync(logsDir, { recursive: true });
  }
  transports.push(
    new import_winston.default.transports.File({
      filename: import_path.default.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5
    }),
    new import_winston.default.transports.File({
      filename: import_path.default.join(logsDir, "combined.log"),
      maxsize: 5242880,
      maxFiles: 5
    })
  );
}
var logger = import_winston.default.createLogger({
  level: isDevelopment ? "debug" : "info",
  format: logFormat,
  transports
});

// server/services/emailService.ts
var EmailService = class {
  transporter = null;
  /**
   * Initialize email transporter
   */
  getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }
    if (!config.email.user || !config.email.pass) {
      logger.warn("Email not configured. Email notifications will not be sent.");
      this.transporter = import_nodemailer.default.createTransport({
        jsonTransport: true
      });
      return this.transporter;
    }
    this.transporter = import_nodemailer.default.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
    return this.transporter;
  }
  /**
   * Send booking inquiry notification to owner
   */
  async sendInquiryNotification(inquiry) {
    try {
      const transporter = this.getTransporter();
      const mailOptions = {
        from: config.email.from,
        to: config.email.to,
        subject: `Ny booking foresp\xF8rgsel - ${inquiry.name}`,
        html: `
          <h2>Ny booking foresp\xF8rgsel</h2>
          <p><strong>Navn:</strong> ${inquiry.name}</p>
          <p><strong>Email:</strong> ${inquiry.email}</p>
          ${inquiry.phone ? `<p><strong>Telefon:</strong> ${inquiry.phone}</p>` : ""}
          <p><strong>Ankomst:</strong> ${inquiry.arrivalDate}</p>
          <p><strong>Afrejse:</strong> ${inquiry.departureDate}</p>
          <p><strong>Antal personer:</strong> ${inquiry.numPeople}</p>
          ${inquiry.message ? `<p><strong>Besked:</strong><br>${inquiry.message}</p>` : ""}
          <hr>
          <p><small>Booking ID: ${inquiry.id}</small></p>
        `
      };
      await transporter.sendMail(mailOptions);
      logger.info(`Inquiry notification sent for ID: ${inquiry.id}`);
    } catch (error) {
      logger.error("Failed to send inquiry notification", { error, inquiryId: inquiry.id });
    }
  }
  /**
   * Send booking confirmation to guest
   */
  async sendInquiryConfirmation(email, name) {
    try {
      const transporter = this.getTransporter();
      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: "Tak for din foresp\xF8rgsel - Elins Overnatningshave",
        html: `
          <h2>Tak for din foresp\xF8rgsel</h2>
          <p>K\xE6re ${name},</p>
          <p>Vi har modtaget din booking foresp\xF8rgsel og vil vende tilbage til dig hurtigst muligt.</p>
          <p>Du vil modtage en bekr\xE6ftelse p\xE5 email n\xE5r din booking er behandlet.</p>
          <br>
          <p>Med venlig hilsen,<br>Elin</p>
        `
      };
      await transporter.sendMail(mailOptions);
      logger.info(`Confirmation email sent to: ${email}`);
    } catch (error) {
      logger.error("Failed to send confirmation email", { error, email });
    }
  }
  /**
   * Send contact form notification
   */
  async sendContactNotification(contact) {
    try {
      const transporter = this.getTransporter();
      const mailOptions = {
        from: config.email.from,
        to: config.email.to,
        subject: `Ny kontaktbesked - ${contact.name}${contact.subject ? ` (${contact.subject})` : ""}`,
        html: `
          <h2>Ny kontaktbesked</h2>
          <p><strong>Navn:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          ${contact.subject ? `<p><strong>Emne:</strong> ${contact.subject}</p>` : ""}
          <p><strong>Besked:</strong><br>${contact.message}</p>
          <hr>
          <p><small>Kontakt ID: ${contact.id}</small></p>
        `
      };
      await transporter.sendMail(mailOptions);
      logger.info(`Contact notification sent for ID: ${contact.id}`);
    } catch (error) {
      logger.error("Failed to send contact notification", { error, contactId: contact.id });
    }
  }
};
var emailService = new EmailService();

// server/services/inquiryService.ts
var InquiryService = class {
  /**
   * Create a new inquiry
   */
  async createInquiry(data) {
    try {
      const hasOverlap = await inquiryRepository.hasOverlap(data.arrivalDate, data.departureDate);
      if (hasOverlap) {
        throw new Error("Der er allerede en booking i denne periode");
      }
      const inquiry = await inquiryRepository.create(data);
      logger.info(`Created inquiry ID: ${inquiry.id}`, { inquiry });
      emailService.sendInquiryNotification({ ...data, id: inquiry.id });
      emailService.sendInquiryConfirmation(data.email, data.name);
      return inquiry;
    } catch (error) {
      logger.error("Failed to create inquiry", { error, data });
      throw error;
    }
  }
  /**
   * Get all inquiries
   */
  async getAllInquiries(status, limit) {
    try {
      return await inquiryRepository.findAll({
        status,
        limit
      });
    } catch (error) {
      logger.error("Failed to get inquiries", { error });
      throw error;
    }
  }
  /**
   * Get inquiry by ID
   */
  async getInquiryById(id) {
    try {
      return await inquiryRepository.findById(id);
    } catch (error) {
      logger.error("Failed to get inquiry", { error, id });
      throw error;
    }
  }
  /**
   * Check availability for dates
   */
  async checkAvailability(arrivalDate, departureDate) {
    try {
      return !await inquiryRepository.hasOverlap(arrivalDate, departureDate);
    } catch (error) {
      logger.error("Failed to check availability", { error, arrivalDate, departureDate });
      throw error;
    }
  }
};
var inquiryService = new InquiryService();

// server/controllers/inquiryController.ts
var InquiryController = class {
  /**
   * Create a new inquiry
   */
  async createInquiry(req, res) {
    const data = req.body;
    const inquiry = await inquiryService.createInquiry(data);
    res.status(201).json({
      success: true,
      message: "Din foresp\xF8rgsel er modtaget. Vi vender tilbage til dig hurtigst muligt.",
      data: inquiry
    });
  }
  /**
   * Get all inquiries
   */
  async getAllInquiries(req, res) {
    const { status, limit } = req.query;
    const inquiries = await inquiryService.getAllInquiries(
      status,
      limit ? parseInt(limit, 10) : void 0
    );
    res.status(200).json({
      success: true,
      data: inquiries,
      count: inquiries.length
    });
  }
  /**
   * Get inquiry by ID
   */
  async getInquiryById(req, res) {
    const id = parseInt(req.params.id, 10);
    const inquiry = await inquiryService.getInquiryById(id);
    if (!inquiry) {
      res.status(404).json({
        success: false,
        message: "Foresp\xF8rgsel ikke fundet"
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: inquiry
    });
  }
  /**
   * Check availability
   */
  async checkAvailability(req, res) {
    const { arrivalDate, departureDate } = req.query;
    if (!arrivalDate || !departureDate) {
      res.status(400).json({
        success: false,
        message: "Ankomst- og afrejsedato er p\xE5kr\xE6vet"
      });
      return;
    }
    const isAvailable = await inquiryService.checkAvailability(
      arrivalDate,
      departureDate
    );
    res.status(200).json({
      success: true,
      data: {
        available: isAvailable,
        message: isAvailable ? "Perioden er tilg\xE6ngelig" : "Der er allerede en booking i denne periode"
      }
    });
  }
};
var inquiryController = new InquiryController();

// server/middleware/validator.ts
function validateBody(schema) {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

// server/middleware/errorHandler.ts
var import_zod = require("zod");
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// server/types/index.ts
var import_zod2 = require("zod");
var createInquirySchema = import_zod2.z.object({
  name: import_zod2.z.string().min(2, "Navn skal v\xE6re mindst 2 tegn").max(100, "Navn m\xE5 max v\xE6re 100 tegn"),
  email: import_zod2.z.string().email("Ugyldig email adresse"),
  phone: import_zod2.z.string().optional(),
  arrivalDate: import_zod2.z.string().refine((date) => {
    const arrivalDate = new Date(date);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    return arrivalDate >= today;
  }, "Ankomstdato skal v\xE6re i dag eller senere"),
  departureDate: import_zod2.z.string(),
  numPeople: import_zod2.z.number().int().min(1, "Der skal mindst v\xE6re 1 person").max(10, "Max 10 personer"),
  message: import_zod2.z.string().max(1e3, "Besked m\xE5 max v\xE6re 1000 tegn").optional()
}).refine((data) => {
  const arrival = new Date(data.arrivalDate);
  const departure = new Date(data.departureDate);
  return departure > arrival;
}, {
  message: "Afrejsedato skal v\xE6re efter ankomstdato",
  path: ["departureDate"]
});
var createContactSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(2, "Navn skal v\xE6re mindst 2 tegn").max(100, "Navn m\xE5 max v\xE6re 100 tegn"),
  email: import_zod2.z.string().email("Ugyldig email adresse"),
  subject: import_zod2.z.string().max(200, "Emne m\xE5 max v\xE6re 200 tegn").optional(),
  message: import_zod2.z.string().min(10, "Besked skal v\xE6re mindst 10 tegn").max(2e3, "Besked m\xE5 max v\xE6re 2000 tegn")
});
var createGalleryImageSchema = import_zod2.z.object({
  title: import_zod2.z.string().min(1, "Titel er p\xE5kr\xE6vet").max(255, "Titel m\xE5 max v\xE6re 255 tegn"),
  description: import_zod2.z.string().max(1e3, "Beskrivelse m\xE5 max v\xE6re 1000 tegn").optional(),
  image_url: import_zod2.z.string().optional(),
  file_path: import_zod2.z.string().optional(),
  is_active: import_zod2.z.preprocess((val) => val === "true" || val === true, import_zod2.z.boolean()).default(true),
  sort_order: import_zod2.z.preprocess((val) => val === "" || val == null ? 0 : Number(val), import_zod2.z.number().int().min(0)).default(0)
});
var updateGalleryImageSchema = createGalleryImageSchema.partial();
var reorderGallerySchema = import_zod2.z.object({
  imageIds: import_zod2.z.array(import_zod2.z.number().int().positive()).min(1, "Mindst \xE9t billede ID er p\xE5kr\xE6vet")
});
var loginSchema = import_zod2.z.object({
  username: import_zod2.z.string().min(1, "Brugernavn er p\xE5kr\xE6vet"),
  password: import_zod2.z.string().min(1, "Password er p\xE5kr\xE6vet")
});
var createAdminUserSchema = import_zod2.z.object({
  username: import_zod2.z.string().min(3, "Brugernavn skal v\xE6re mindst 3 tegn").max(100, "Brugernavn m\xE5 max v\xE6re 100 tegn"),
  email: import_zod2.z.string().email("Ugyldig email adresse"),
  password: import_zod2.z.string().min(6, "Password skal v\xE6re mindst 6 tegn"),
  is_active: import_zod2.z.boolean().default(true)
});

// server/routes/inquiryRoutes.ts
var router = (0, import_express.Router)();
router.post(
  "/",
  validateBody(createInquirySchema),
  asyncHandler(inquiryController.createInquiry.bind(inquiryController))
);
router.get(
  "/availability",
  asyncHandler(inquiryController.checkAvailability.bind(inquiryController))
);
router.get(
  "/",
  asyncHandler(inquiryController.getAllInquiries.bind(inquiryController))
);
router.get(
  "/:id",
  asyncHandler(inquiryController.getInquiryById.bind(inquiryController))
);
var inquiryRoutes_default = router;

// server/routes/contactRoutes.ts
var import_express2 = require("express");

// server/repositories/contactRepository.ts
var ContactRepository = class {
  /**
   * Create a new contact message
   */
  async create(data) {
    const result = await queryOne(
      `INSERT INTO contacts (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        data.name,
        data.email,
        data.subject || null,
        data.message
      ]
    );
    if (!result) {
      throw new Error("Failed to create contact");
    }
    return await this.findById(result.id);
  }
  /**
   * Find contact by ID
   */
  async findById(id) {
    const row = await queryOne("SELECT * FROM contacts WHERE id = $1", [id]);
    return row || void 0;
  }
  /**
   * Get all contact messages
   */
  async findAll(filters) {
    let queryText = "SELECT * FROM contacts";
    const params = [];
    let paramIndex = 1;
    if (filters?.isRead !== void 0) {
      queryText += ` WHERE is_read = $${paramIndex++}`;
      params.push(filters.isRead);
    }
    queryText += " ORDER BY created_at DESC";
    if (filters?.limit) {
      queryText += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }
    const rows = await query(queryText, params);
    return rows;
  }
  /**
   * Mark contact as read
   */
  async markAsRead(id) {
    const result = await execute("UPDATE contacts SET is_read = true WHERE id = $1", [id]);
    return result.rowCount > 0;
  }
  /**
   * Delete contact
   */
  async delete(id) {
    const result = await execute("DELETE FROM contacts WHERE id = $1", [id]);
    return result.rowCount > 0;
  }
};
var contactRepository = new ContactRepository();

// server/services/contactService.ts
var ContactService = class {
  /**
   * Create a new contact message
   */
  async createContact(data) {
    try {
      const contact = await contactRepository.create(data);
      logger.info(`Created contact ID: ${contact.id}`, { contact });
      emailService.sendContactNotification({ ...data, id: contact.id });
      return contact;
    } catch (error) {
      logger.error("Failed to create contact", { error, data });
      throw error;
    }
  }
  /**
   * Get all contact messages
   */
  async getAllContacts(isRead, limit) {
    try {
      return await contactRepository.findAll({ isRead, limit });
    } catch (error) {
      logger.error("Failed to get contacts", { error });
      throw error;
    }
  }
  /**
   * Get contact by ID
   */
  async getContactById(id) {
    try {
      return await contactRepository.findById(id);
    } catch (error) {
      logger.error("Failed to get contact", { error, id });
      throw error;
    }
  }
};
var contactService = new ContactService();

// server/controllers/contactController.ts
var ContactController = class {
  /**
   * Create a new contact message
   */
  async createContact(req, res) {
    const data = req.body;
    const contact = await contactService.createContact(data);
    res.status(201).json({
      success: true,
      message: "Tak for din besked. Vi vender tilbage til dig hurtigst muligt.",
      data: contact
    });
  }
  /**
   * Get all contact messages
   */
  async getAllContacts(req, res) {
    const { isRead, limit } = req.query;
    const contacts = await contactService.getAllContacts(
      isRead === "true" ? true : isRead === "false" ? false : void 0,
      limit ? parseInt(limit, 10) : void 0
    );
    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length
    });
  }
  /**
   * Get contact by ID
   */
  async getContactById(req, res) {
    const id = parseInt(req.params.id, 10);
    const contact = await contactService.getContactById(id);
    if (!contact) {
      res.status(404).json({
        success: false,
        message: "Besked ikke fundet"
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: contact
    });
  }
};
var contactController = new ContactController();

// server/routes/contactRoutes.ts
var router2 = (0, import_express2.Router)();
router2.post(
  "/",
  validateBody(createContactSchema),
  asyncHandler(contactController.createContact.bind(contactController))
);
router2.get(
  "/",
  asyncHandler(contactController.getAllContacts.bind(contactController))
);
router2.get(
  "/:id",
  asyncHandler(contactController.getContactById.bind(contactController))
);
var contactRoutes_default = router2;

// server/routes/galleryRoutes.ts
var import_express3 = require("express");

// server/repositories/galleryRepository.ts
var GalleryRepository = class {
  /**
   * Get all active gallery images ordered by sort_order
   */
  async getActiveImages() {
    try {
      const rows = await query(
        `SELECT id, title, description, image_url, image_path as file_path, is_active, sort_order, created_at, updated_at
         FROM gallery_images
         WHERE is_active = true
         ORDER BY sort_order ASC, created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error fetching active gallery images:", error);
      throw error;
    }
  }
  /**
   * Get all gallery images (including inactive) for admin
   */
  async getAllImages() {
    try {
      const rows = await query(
        `SELECT id, title, description, image_url, image_path as file_path, is_active, sort_order, created_at, updated_at
         FROM gallery_images
         ORDER BY sort_order ASC, created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error fetching all gallery images:", error);
      throw error;
    }
  }
  /**
   * Get gallery image by ID
   */
  async getImageById(id) {
    try {
      const row = await queryOne(
        `SELECT id, title, description, image_url, image_path as file_path, is_active, sort_order, created_at, updated_at
         FROM gallery_images
         WHERE id = $1`,
        [id]
      );
      return row;
    } catch (error) {
      console.error("Error fetching gallery image by ID:", error);
      throw error;
    }
  }
  /**
   * Create new gallery image
   */
  async createImage(imageData) {
    try {
      const { title, description, image_url, is_active, sort_order } = imageData;
      let finalSortOrder = sort_order || 0;
      if (finalSortOrder === 0) {
        const maxSortResult = await queryOne(
          "SELECT MAX(sort_order) as max_sort FROM gallery_images"
        );
        const maxSort = maxSortResult?.max_sort || 0;
        finalSortOrder = maxSort + 1;
      }
      const result = await queryOne(
        `INSERT INTO gallery_images (title, description, image_url, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [title, description, image_url, is_active, finalSortOrder]
      );
      if (!result) {
        throw new Error("Failed to create image");
      }
      const createdImage = await this.getImageById(result.id);
      if (!createdImage) {
        throw new Error("Failed to retrieve created image");
      }
      return createdImage;
    } catch (error) {
      console.error("Error creating gallery image:", error);
      throw error;
    }
  }
  /**
   * Update gallery image
   */
  async updateImage(id, imageData) {
    try {
      const { title, description, image_url, file_path, is_active, sort_order } = imageData;
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;
      if (title !== void 0) {
        updateFields.push(`title = $${paramIndex++}`);
        updateValues.push(title);
      }
      if (description !== void 0) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(description);
      }
      if (image_url !== void 0) {
        updateFields.push(`image_url = $${paramIndex++}`);
        updateValues.push(image_url);
      }
      if (file_path !== void 0) {
        updateFields.push(`image_path = $${paramIndex++}`);
        updateValues.push(file_path);
      }
      if (is_active !== void 0) {
        updateFields.push(`is_active = $${paramIndex++}`);
        updateValues.push(is_active);
      }
      if (sort_order !== void 0) {
        updateFields.push(`sort_order = $${paramIndex++}`);
        updateValues.push(sort_order);
      }
      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }
      updateFields.push("updated_at = CURRENT_TIMESTAMP");
      updateValues.push(id);
      const result = await execute(
        `UPDATE gallery_images SET ${updateFields.join(", ")} WHERE id = $${paramIndex}`,
        updateValues
      );
      if (result.rowCount === 0) {
        return null;
      }
      return await this.getImageById(id);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      throw error;
    }
  }
  /**
   * Delete gallery image
   */
  async deleteImage(id) {
    try {
      const result = await execute("DELETE FROM gallery_images WHERE id = $1", [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      throw error;
    }
  }
  /**
   * Reorder gallery images
   */
  async reorderImages(imageIds) {
    try {
      for (let i = 0; i < imageIds.length; i++) {
        await execute(
          "UPDATE gallery_images SET sort_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [i + 1, imageIds[i]]
        );
      }
    } catch (error) {
      console.error("Error reordering gallery images:", error);
      throw error;
    }
  }
  /**
   * Get max sort order
   */
  async getMaxSortOrder() {
    try {
      const result = await queryOne(
        "SELECT MAX(sort_order) as max_sort FROM gallery_images"
      );
      return result?.max_sort || 0;
    } catch (error) {
      console.error("Error getting max sort order:", error);
      throw error;
    }
  }
};
var galleryRepository = new GalleryRepository();

// server/middleware/upload.ts
var import_multer = __toESM(require("multer"));
var import_path2 = __toESM(require("path"));
var import_fs2 = __toESM(require("fs"));
var fileFilter = (_req, file, cb) => {
  const allowedTypes = config.upload.allowedTypes;
  const fileMime = file.mimetype.toLowerCase();
  if (allowedTypes.includes(fileMime)) {
    cb(null, true);
  } else {
    cb(new Error(`Ugyldig filtype. Tilladte typer: ${allowedTypes.join(", ")}`));
  }
};
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1
  }
});
async function uploadToBlob(buffer, originalname, mimetype) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const ext = import_path2.default.extname(originalname).toLowerCase();
  const filename = `${timestamp}-${randomString}${ext}`;
  if (config.blob.readWriteToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`gallery/${filename}`, buffer, {
      access: "public",
      contentType: mimetype,
      token: config.blob.readWriteToken
    });
    logger.info("File uploaded to Vercel Blob", { url: blob.url });
    return blob.url;
  } else {
    const tmpDir = "/tmp/uploads";
    if (!import_fs2.default.existsSync(tmpDir)) {
      import_fs2.default.mkdirSync(tmpDir, { recursive: true });
    }
    const filePath = import_path2.default.join(tmpDir, filename);
    import_fs2.default.writeFileSync(filePath, buffer);
    logger.info("File saved to local /tmp fallback", { filePath });
    return `/tmp-uploads/${filename}`;
  }
}
function handleUploadError(error, req, res, next) {
  if (error instanceof import_multer.default.MulterError) {
    let message = "Fil upload fejlede";
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = `Filen er for stor. Max st\xF8rrelse er ${config.upload.maxFileSize / 1024 / 1024}MB`;
        break;
      case "LIMIT_FILE_COUNT":
        message = "For mange filer. Kun \xE9n fil tilladt";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Uventet fil felt";
        break;
      default:
        message = `Upload error: ${error.message}`;
    }
    logger.warn("Multer upload error", {
      error: error.message,
      code: error.code
    });
    res.status(400).json({
      success: false,
      message
    });
    return;
  }
  if (error.message.includes("Ugyldig filtype")) {
    logger.warn("Invalid file type", {
      error: error.message,
      mimetype: req.file?.mimetype
    });
    res.status(400).json({
      success: false,
      message: error.message
    });
    return;
  }
  next(error);
}

// server/controllers/galleryController.ts
var GalleryController = class {
  /**
   * Get all active gallery images (public endpoint)
   */
  async getActiveImages(_req, res) {
    try {
      const images = await galleryRepository.getActiveImages();
      res.status(200).json({
        success: true,
        data: images,
        count: images.length
      });
    } catch (error) {
      logger.error("Error in getActiveImages controller", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Kunne ikke hente billeder"
      });
    }
  }
  /**
   * Get all gallery images (admin endpoint)
   */
  async getAllImages(_req, res) {
    try {
      const images = await galleryRepository.getAllImages();
      res.status(200).json({
        success: true,
        data: images,
        count: images.length
      });
    } catch (error) {
      logger.error("Error in getAllImages controller", {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Kunne ikke hente billeder"
      });
    }
  }
  /**
   * Get gallery image by ID
   */
  async getImageById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Ugyldigt billede ID"
        });
        return;
      }
      const image = await galleryRepository.getImageById(id);
      if (!image) {
        res.status(404).json({
          success: false,
          message: "Billede ikke fundet"
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: image
      });
    } catch (error) {
      logger.error("Error in getImageById controller", {
        id: req.params.id,
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Kunne ikke hente billede"
      });
    }
  }
  /**
   * Create new gallery image
   */
  async createImage(req, res) {
    try {
      const validatedData = createGalleryImageSchema.parse(req.body);
      if (req.file) {
        const blobUrl = await uploadToBlob(req.file.buffer, req.file.originalname, req.file.mimetype);
        validatedData.image_url = blobUrl;
      }
      const image = await galleryRepository.createImage({
        title: validatedData.title,
        description: validatedData.description,
        image_url: validatedData.image_url || "",
        sort_order: validatedData.sort_order || 0,
        is_active: true
      });
      res.status(201).json({
        success: true,
        message: "Billede oprettet succesfuldt",
        data: image
      });
    } catch (error) {
      logger.error("Error in createImage controller", {
        body: req.body,
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Kunne ikke oprette billede"
      });
    }
  }
  /**
   * Update gallery image
   */
  async updateImage(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Ugyldigt billede ID"
        });
        return;
      }
      const validatedData = updateGalleryImageSchema.parse(req.body);
      if (req.file) {
        const blobUrl = await uploadToBlob(req.file.buffer, req.file.originalname, req.file.mimetype);
        validatedData.image_url = blobUrl;
      }
      const image = await galleryRepository.updateImage(id, validatedData);
      if (!image) {
        res.status(404).json({
          success: false,
          message: "Billede ikke fundet"
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Billede opdateret succesfuldt",
        data: image
      });
    } catch (error) {
      logger.error("Error in updateImage controller", {
        id: req.params.id,
        body: req.body,
        error: error.message
      });
      const statusCode = error.message.includes("ikke fundet") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Kunne ikke opdatere billede"
      });
    }
  }
  /**
   * Delete gallery image
   */
  async deleteImage(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Ugyldigt billede ID"
        });
        return;
      }
      const deleted = await galleryRepository.deleteImage(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Billede ikke fundet"
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Billede slettet succesfuldt"
      });
    } catch (error) {
      logger.error("Error in deleteImage controller", {
        id: req.params.id,
        error: error.message
      });
      const statusCode = error.message.includes("ikke fundet") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Kunne ikke slette billede"
      });
    }
  }
  /**
   * Reorder gallery images
   */
  async reorderImages(req, res) {
    try {
      logger.info("Reorder request received", { body: req.body });
      const validatedData = reorderGallerySchema.parse(req.body);
      await galleryRepository.reorderImages(validatedData.imageIds);
      res.status(200).json({
        success: true,
        message: "Billeder reorganiseret succesfuldt"
      });
    } catch (error) {
      logger.error("Error in reorderImages controller", {
        body: req.body,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : void 0
      });
      if (error && typeof error === "object" && "issues" in error) {
        res.status(400).json({
          success: false,
          message: "Ugyldig data",
          errors: error.issues
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || "Kunne ikke reorganisere billeder"
      });
    }
  }
  /**
   * Toggle image active status
   */
  async toggleImageStatus(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: "Ugyldigt billede ID"
        });
        return;
      }
      const currentImage = await galleryRepository.getImageById(id);
      if (!currentImage) {
        res.status(404).json({
          success: false,
          message: "Billede ikke fundet"
        });
        return;
      }
      const image = await galleryRepository.updateImage(id, {
        is_active: !currentImage.is_active
      });
      res.status(200).json({
        success: true,
        message: `Billede ${image?.is_active ? "aktiveret" : "deaktiveret"} succesfuldt`,
        data: image
      });
    } catch (error) {
      logger.error("Error in toggleImageStatus controller", {
        id: req.params.id,
        error: error.message
      });
      const statusCode = error.message.includes("ikke fundet") ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Kunne ikke \xE6ndre billede status"
      });
    }
  }
};
var galleryController = new GalleryController();

// server/services/authService.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcrypt = __toESM(require("bcrypt"));
var AuthService = class {
  /**
   * Generate JWT token for user
   */
  generateToken(userId, username) {
    const options = { expiresIn: config.jwtExpiresIn };
    return import_jsonwebtoken.default.sign(
      {
        userId,
        username,
        type: "admin"
      },
      config.jwtSecret,
      options
    );
  }
  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return import_jsonwebtoken.default.verify(token, config.jwtSecret);
    } catch (error) {
      logger.warn("Invalid JWT token", { error: error.message });
      throw new Error("Invalid token");
    }
  }
  /**
   * Hash password using bcrypt
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return import_bcrypt.default.hash(password, saltRounds);
  }
  /**
   * Compare password with hash
   */
  async comparePassword(password, hash) {
    return import_bcrypt.default.compare(password, hash);
  }
  /**
   * Authenticate user with username and password
   */
  async login(credentials) {
    const { username, password } = credentials;
    try {
      const user = await queryOne(
        "SELECT id, username, email, password_hash FROM admin_users WHERE username = $1",
        [username]
      );
      if (!user) {
        throw new Error("Invalid credentials");
      }
      const isValidPassword = await this.comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }
      const token = this.generateToken(user.id, user.username);
      logger.info("Admin user logged in", { userId: user.id, username: user.username });
      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      };
    } catch (error) {
      logger.error("Login failed", {
        username,
        error: error.message
      });
      throw error;
    }
  }
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await queryOne(
        "SELECT id, username FROM admin_users WHERE id = $1",
        [userId]
      );
      return user || null;
    } catch (error) {
      logger.error("Error fetching user by ID", {
        userId,
        error: error.message
      });
      throw error;
    }
  }
  /**
   * Create new admin user
   */
  async createUser(userData) {
    try {
      const { username, password } = userData;
      const existingUser = await queryOne(
        "SELECT id FROM admin_users WHERE username = $1",
        [username]
      );
      if (existingUser) {
        throw new Error("User with this username already exists");
      }
      const passwordHash = await this.hashPassword(password);
      const result = await queryOne(
        "INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) RETURNING id",
        [username, passwordHash]
      );
      if (!result) {
        throw new Error("Failed to create user");
      }
      const userId = result.id;
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error("Failed to create user");
      }
      logger.info("New admin user created", { userId, username });
      return user;
    } catch (error) {
      logger.error("Error creating admin user", {
        userData: { username: userData.username },
        error: error.message
      });
      throw error;
    }
  }
};
var authService = new AuthService();

// server/middleware/auth.ts
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token er p\xE5kr\xE6vet"
      });
      return;
    }
    const decoded = authService.verifyToken(token);
    req.user = {
      id: decoded.userId,
      username: decoded.username
    };
    next();
  } catch (error) {
    logger.warn("Authentication failed", {
      error: error.message,
      headers: req.headers
    });
    res.status(403).json({
      success: false,
      message: "Ugyldig eller udl\xF8bet token"
    });
  }
}

// server/routes/galleryRoutes.ts
var router3 = (0, import_express3.Router)();
router3.get("/", galleryController.getActiveImages.bind(galleryController));
router3.get("/admin", authenticateToken, galleryController.getAllImages.bind(galleryController));
router3.put("/admin/reorder", authenticateToken, galleryController.reorderImages.bind(galleryController));
router3.get("/admin/:id", authenticateToken, galleryController.getImageById.bind(galleryController));
router3.post(
  "/admin",
  authenticateToken,
  upload.single("image"),
  handleUploadError,
  galleryController.createImage.bind(galleryController)
);
router3.put(
  "/admin/:id",
  authenticateToken,
  upload.single("image"),
  handleUploadError,
  galleryController.updateImage.bind(galleryController)
);
router3.patch(
  "/admin/:id",
  authenticateToken,
  upload.single("image"),
  handleUploadError,
  galleryController.updateImage.bind(galleryController)
);
router3.put("/admin/:id/toggle", authenticateToken, galleryController.toggleImageStatus.bind(galleryController));
router3.delete("/admin/:id", authenticateToken, galleryController.deleteImage.bind(galleryController));
var galleryRoutes_default = router3;

// server/routes/authRoutes.ts
var import_express4 = require("express");

// server/controllers/authController.ts
var AuthController = class {
  /**
   * Login endpoint
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: "Brugernavn og adgangskode er p\xE5kr\xE6vet"
        });
        return;
      }
      const result = await authService.login({ username, password });
      res.json({
        success: true,
        message: "Login succesfuldt",
        data: result
      });
    } catch (error) {
      logger.error("Login error", { error });
      res.status(401).json({
        success: false,
        message: "Ugyldigt brugernavn eller adgangskode"
      });
    }
  }
  /**
   * Get current user info
   */
  async getCurrentUser(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Mangler token"
        });
        return;
      }
      const decoded = authService.verifyToken(token);
      if (!decoded) {
        res.status(401).json({
          success: false,
          message: "Ugyldig token"
        });
        return;
      }
      res.json({
        success: true,
        data: {
          id: decoded.userId,
          username: decoded.username
        }
      });
    } catch (error) {
      logger.error("Get current user error", { error });
      res.status(500).json({
        success: false,
        message: "Der opstod en fejl"
      });
    }
  }
  /**
   * Create new admin user (for initial setup)
   */
  async createUser(req, res) {
    try {
      const userData = createAdminUserSchema.parse(req.body);
      const user = await authService.createUser(userData);
      res.status(201).json({
        success: true,
        message: "Admin bruger oprettet succesfuldt",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        }
      });
    } catch (error) {
      logger.error("Error creating admin user", {
        body: { username: req.body.username, email: req.body.email },
        error: error.message
      });
      const statusCode = error.message.includes("already exists") ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Kunne ikke oprette bruger"
      });
    }
  }
  /**
   * Logout endpoint (client-side token removal)
   */
  async logout(req, res) {
    try {
      logger.info("User logged out", {
        userId: req.user?.id,
        username: req.user?.username
      });
      res.status(200).json({
        success: true,
        message: "Logout succesfuldt"
      });
    } catch (error) {
      logger.error("Error during logout", {
        userId: req.user?.id,
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: "Logout fejlede"
      });
    }
  }
  /**
   * Validate token endpoint
   */
  async validateToken(req, res) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Ugyldig token"
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Token er gyldig",
        data: {
          user: req.user
        }
      });
    } catch (error) {
      logger.error("Error validating token", {
        error: error.message
      });
      res.status(401).json({
        success: false,
        message: "Token validering fejlede"
      });
    }
  }
};
var authController = new AuthController();

// server/routes/authRoutes.ts
var router4 = (0, import_express4.Router)();
router4.post("/login", authController.login.bind(authController));
router4.get("/me", authenticateToken, authController.getCurrentUser.bind(authController));
router4.post("/logout", authenticateToken, authController.logout.bind(authController));
router4.get("/validate", authenticateToken, authController.validateToken.bind(authController));
router4.post("/users", authController.createUser.bind(authController));
var authRoutes_default = router4;

// server/handler.ts
var app = (0, import_express5.default)();
app.use((0, import_helmet.default)({
  contentSecurityPolicy: false
}));
app.use((0, import_cors.default)({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(import_express5.default.json());
app.use(import_express5.default.urlencoded({ extended: true }));
var limiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 100
});
app.use("/api/", limiter);
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api/inquiries", inquiryRoutes_default);
app.use("/api/contacts", contactRoutes_default);
app.use("/api/gallery", galleryRoutes_default);
app.use("/api/auth", authRoutes_default);
app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});
async function handler(req, res) {
  return app(req, res);
}
