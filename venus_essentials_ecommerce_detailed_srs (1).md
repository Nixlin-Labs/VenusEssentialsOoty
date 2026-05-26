# Software Requirements Specification (SRS)
## Venus Essentials – Ecommerce Platform

---

# 1. Introduction

## 1.1 Project Title
Venus Essentials Ecommerce Platform

---

## 1.2 Project Overview
Venus Essentials is a 40+ year heritage business transitioning from offline operations into a digital commerce platform. The proposed ecommerce system will provide customers with a premium online shopping experience for products including coffee powders, tea powders, chocolates, essential oils, and related wellness and consumable products.

The platform will support product browsing, variant-based inventory management, online payments, order management, GST-compliant invoicing, customer accounts, and role-based administration.

The solution will be designed as a scalable mid-scale ecommerce platform with strong branding, SEO readiness, clean customer experience, and simplified administrative workflows.

---

## 1.3 Purpose of the Document
This document defines the functional and non-functional requirements for the Venus Essentials Ecommerce Platform. It serves as the technical and business reference for:

- Stakeholders
- Developers
- Designers
- QA/Test Engineers
- Administrators
- Future maintenance teams

---

## 1.4 Project Goals

### Primary Goals
- Digitize the existing business operations
- Create a premium branded ecommerce experience
- Increase direct online sales
- Improve customer reach and brand visibility
- Provide manageable inventory and order operations
- Build a scalable ecommerce foundation

### Secondary Goals
- Improve SEO presence
- Enable digital customer engagement
- Simplify order tracking and administration
- Create a future-ready architecture for mobile applications

---

# 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Authentication | JWT + Refresh Token |
| State Management | Zustand |
| State Persistence | Zustand Persist Middleware |
| Local Storage Security | AES Encryption |
| Styling | Tailwind CSS |
| Animations | GSAP + Framer Motion |
| Toast Notifications | Sonner |
| Confirmation Modals | Custom Reusable Modal System |
| Payment Gateway | Razorpay |
| Hosting | Client Provided VPS/Hosting |
| Media Storage | Server Storage |
| Admin Panel | Separate Admin Application |
| Styling/UI | Existing Stitch Design |

---

## 2.1 Frontend Architecture Standards

### State Management
The application shall use Zustand for lightweight and scalable global state management.

### Persistence Layer
Persistent frontend state shall use Zustand Persist Middleware.

### Local Storage Encryption
Sensitive persisted client-side data shall be encrypted using AES encryption before storage.

### Styling System
Tailwind CSS shall be used for the complete styling architecture.

### Animation Frameworks
The application shall use:
- GSAP for advanced timeline and interaction animations
- Framer Motion for React component animations and transitions

### Toast Notification System
Sonner shall be used for toast notifications.

### Confirmation Modal System
A reusable centralized confirmation modal system shall be implemented.

The modal architecture shall support:
- Dynamic confirmation messages
- Loading states
- Async action handling
- Error handling
- Reusable action callbacks
- Centralized state handling

### Scalability Standards
The frontend architecture shall follow:
- Modular folder structure
- Reusable component architecture
- Centralized API handling
- Typed validation schemas
- Reusable hooks
- Separation of concerns
- Config-driven architecture where applicable
- Production-ready scalable coding standards

---

# 3. User Roles

## 3.1 Guest User
A non-authenticated visitor.

### Permissions
- Browse products
- Search products
- View categories
- Add products to cart
- Add wishlist locally
- Checkout as guest
- Register/Login

---

## 3.2 Customer
Authenticated customer account.

### Permissions
- Manage profile
- Manage addresses
- Place orders
- Track orders
- Download invoices
- Submit product reviews
- View order history
- Manage wishlist
- Cancel orders before dispatch

---

## 3.3 Super Admin
Complete system control.

### Permissions
- Full platform access
- User and role management
- Product and inventory management
- Order and refund management
- CMS management
- Reports and analytics
- Settings management

---

## 3.4 Manager
Operational management role.

### Permissions
- Product management
- Inventory management
- Order management
- Review moderation
- Coupon management

---

## 3.5 Inventory Staff
Limited inventory operations role.

### Permissions
- Update stock
- View products
- View inventory alerts

---

## 3.6 Content Manager
Content-focused administration role.

### Permissions
- Manage banners
- Manage CMS pages
- Manage homepage sections
- Manage blogs/content pages

---

# 4. Authentication System

## 4.1 Customer Authentication

### Features
- User registration
- Login via email/mobile
- Password-based authentication
- OTP verification via SMS/email
- Forgot password
- Password reset
- JWT-based authentication
- Refresh token management
- Logout functionality

---

## 4.2 Guest Checkout
The platform shall support guest checkout.

### Guest Checkout Flow
1. User adds products to cart
2. User proceeds to checkout
3. User enters shipping details
4. User completes payment
5. Order is created
6. Optional account creation prompt after order

---

## 4.3 Admin Authentication

### Features
- Secure admin login
- Role-based access control
- JWT authentication
- Session expiration handling
- Protected admin routes

---

# 5. Customer Website Modules

# 5.1 Homepage

## Features
- Hero banners
- Featured categories
- Featured products
- Best sellers
- Brand storytelling sections
- Heritage/business introduction
- Testimonials
- Promotional sections
- Newsletter section (optional)

## Homepage Management
Homepage content shall be semi-dynamic:
- Fixed layout
- Admin-manageable content
- Admin-manageable banners
- Admin-manageable featured products

---

# 5.2 Product Categories

## Features
- Category listing
- Category banners
- Category descriptions
- SEO-friendly URLs
- Product filtering
- Product sorting

---

# 5.3 Product Listing Page

## Features
- Grid/List view
- Product search
- Pagination
- Product sorting
- Product filtering
- Category filtering
- Price filtering
- Availability filtering

## Sorting Options
- Price low to high
- Price high to low
- New arrivals
- Best sellers
- Alphabetical sorting

---

# 5.4 Product Detail Page

## Features
- Multiple product images
- Product zoom
- Variant selection
- Product description
- Ingredients information
- Product specifications
- SKU display
- GST-inclusive pricing
- Stock availability
- Related products
- Customer reviews
- Share functionality

## Variant Features
Each variant shall support:
- Variant-specific pricing
- Variant-specific stock
- Variant-specific SKU
- Variant-specific weight
- Variant-specific offer price

---

# 5.5 Search System

## Features
- Product search
- Category search
- Search suggestions
- Partial keyword matching

---

# 5.6 Wishlist System

## Features
- Add/remove wishlist items
- Wishlist persistence for logged-in users
- Move items from wishlist to cart

---

# 5.7 Cart System

## Features
- Add to cart
- Remove from cart
- Update quantity
- Variant update
- Coupon application
- Shipping charge calculation
- GST calculation
- Cart persistence

## Cart Persistence Rules
| User Type | Persistence Method |
|---|---|
| Guest | Browser Local Storage |
| Logged-in User | Database Sync |

---

# 5.8 Checkout System

## Features
- Guest checkout
- Address selection
- Multiple address support
- Default address support
- Shipping summary
- Coupon support
- GST summary
- Payment summary
- Razorpay payment integration

## Checkout Rules
- Only online payment supported
- COD not supported
- Address validation required
- Stock validation before payment

---

# 5.9 Payment System

## Payment Gateway
Razorpay integration shall be implemented.

## Features
- Secure payment handling
- Razorpay order creation
- Payment verification
- Signature verification
- Failed payment handling
- Refund API integration
- Payment retry support

## Supported Methods
- UPI
- Credit cards
- Debit cards
- Net banking
- Wallets

---

# 5.10 Order System

## Order Flow
Pending Payment
→ Payment Success
→ Order Placed
→ Confirmed
→ Packed
→ Dispatched
→ Delivered

## Additional Statuses
- Payment Failed
- Cancelled
- Rejected
- Refunded

## Features
- Order history
- Order tracking
- Invoice download
- Order cancellation before dispatch

---

# 5.11 Order Cancellation Rules

| Status | Cancellation Allowed |
|---|---|
| Before Dispatch | Yes |
| After Dispatch | No |

---

# 5.12 Refund System

## Features
- Full refund support
- Partial refund support (future-ready)
- Razorpay refund integration
- Refund status tracking

## Refund Conditions
- Order rejection by admin
- Customer cancellation before dispatch

---

# 5.13 Review & Rating System

## Features
- Star ratings
- Text reviews
- Verified purchase reviews
- Admin moderation

## Rules
- Only verified purchasers can review
- Reviews require moderation before publishing

---

# 5.14 Customer Account Module

## Features
- Profile management
- Address management
- Order history
- Wishlist management
- Password management
- Invoice downloads

---

# 5.15 Static & CMS Pages

## Required Pages
- About Us
- Our Heritage
- Contact Us
- Privacy Policy
- Terms & Conditions
- Shipping Policy
- Refund Policy

---

# 6. Admin Panel Modules

# 6.1 Dashboard

## Features
- Revenue summary
- Order summary
- Sales analytics
- Low stock alerts
- Recent orders
- Top products
- Customer statistics

---

# 6.2 Product Management

## Features
- Add/Edit/Delete products
- Variant management
- Product image upload
- SEO fields
- Product status management
- Product tagging
- Category mapping

## Product Fields
- Product name
- Slug
- Description
- Ingredients
- Specifications
- Images
- Category
- SEO metadata
- GST percentage
- HSN/SAC code

---

# 6.3 Variant Management

## Features
- Variant creation
- Variant pricing
- Variant stock
- Variant SKU
- Variant offer price
- Variant weight

---

# 6.4 Category Management

## Features
- Add/Edit/Delete categories
- Category banners
- SEO management
- Category sorting

---

# 6.5 Inventory Management

## Features
- Stock updates
- Variant stock management
- Low stock alerts
- Inventory history

## Inventory Rules
- Negative stock not allowed
- Purchase blocked when stock reaches zero
- Variant inventory managed independently

---

# 6.6 Order Management

## Features
- View orders
- Filter orders
- Update order status
- Add tracking number
- Add courier details
- Generate invoices
- Process refunds

## Dispatch Workflow
1. Admin confirms order
2. Admin packs order
3. Admin dispatches order
4. Admin enters courier name
5. Admin enters tracking number
6. Customer notified

---

# 6.7 Customer Management

## Features
- View customer details
- View order history
- Block/unblock customers
- Customer analytics

---

# 6.8 Coupon Management

## Features
- Create coupons
- Flat discount coupons
- Percentage discount coupons
- Minimum order value
- Usage limits
- Expiry management
- Free shipping rules

---

# 6.9 Review Moderation

## Features
- Approve/reject reviews
- Review visibility management
- Review filtering

---

# 6.10 CMS & Banner Management

## Features
- Homepage banners
- Promotional banners
- CMS page editing
- Homepage featured section management

---

# 6.11 Reports & Analytics

## Reports
- Sales reports
- Revenue reports
- Order reports
- Product performance reports
- Customer reports
- Refund reports

---

# 6.12 Role & Permission Management

## Features
- Role creation
- Permission assignment
- Access restriction
- User-role mapping

---

# 6.13 Settings Module

## Features
- Tax settings
- Shipping settings
- Free shipping threshold
- Business information
- Invoice settings
- Contact settings
- SEO settings

---

# 7. Inventory Architecture

## Inventory Model
Inventory shall be managed at variant level.

## Example
Coffee Powder
- 100g
- 250g
- 500g

Each variant shall maintain:
- Independent stock
- Independent SKU
- Independent pricing
- Independent weight

---

# 8. Order Processing Workflow

## Order Lifecycle
1. Customer places order
2. Payment verification completed
3. Order marked as placed
4. Admin reviews order
5. Order confirmed
6. Order packed
7. Order dispatched
8. Tracking number added
9. Customer notified
10. Order delivered

---

# 9. GST & Invoice System

## Features
- GST-inclusive pricing
- GST invoice generation
- Invoice PDF generation
- Downloadable invoices
- HSN/SAC code support
- CGST/SGST calculations

## Invoice Format
Example:
INV-2026-000001

---

# 10. Notification System

## Email Notifications
- OTP verification
- Order confirmation
- Dispatch notification
- Refund notification
- Password reset

## SMS Notifications
- OTP verification

---

# 11. SEO Requirements

## Features
- SEO-friendly URLs
- Meta title management
- Meta description management
- Sitemap.xml
- Robots.txt
- OpenGraph tags
- Structured schema markup
- Product schema
- Canonical URLs
- Optimized image metadata

---

# 12. Security Requirements

## Authentication Security
- JWT authentication
- Refresh token implementation
- Password hashing
- Session expiration

## API Security
- Input validation
- Rate limiting
- Secure payment verification
- CSRF protection
- XSS protection
- CORS protection

## Admin Security
- Role-based permissions
- Protected routes
- Audit logging

---

# 13. Audit Logging

## Logged Activities
- Product changes
- Inventory changes
- Order status updates
- Refund processing
- User role changes

## Audit Fields
- User
- Timestamp
- Action type
- Previous value
- Updated value

---

# 14. Media Management

## Features
- Multiple image upload
- Image compression
- Web-optimized images
- Thumbnail generation
- Product gallery support

---

# 15. Database Architecture

## Core Collections
- Users
- Roles
- Products
- Product Variants
- Categories
- Orders
- Order Items
- Payments
- Coupons
- Reviews
- Addresses
- CMS Pages
- Banners
- Audit Logs
- Notifications

---

# 16. API Architecture

## API Style
RESTful API architecture shall be implemented.

## API Groups
- Authentication APIs
- Product APIs
- Category APIs
- Cart APIs
- Checkout APIs
- Payment APIs
- Order APIs
- Review APIs
- Admin APIs
- CMS APIs

---

# 17. Performance Requirements

## Requirements
- Fast page loading
- Optimized images
- Lazy loading
- Server-side rendering using Next.js
- Efficient database indexing

## Expected Capacity
- 50+ products
- Multiple variants per product
- Mid-scale concurrent traffic

---

# 18. Scalability Requirements

The architecture shall support future scalability for:
- Mobile applications
- Additional product categories
- Additional admin users
- Advanced analytics
- Third-party integrations

---

# 19. Backup & Recovery

## Requirements
- Automated database backups
- Media backup support
- Recovery procedures
- Error logging

---

# 20. Deployment Requirements

## Environment Structure
- Development
- Staging
- Production

## Production Requirements
- SSL certificate
- Domain configuration
- Environment variables
- Secure API configuration
- Process manager setup

---

# 21. Future Enhancements

## Possible Future Features
- Mobile applications
- WhatsApp order notifications
- Loyalty program
- Referral system
- Subscription orders
- Product recommendations
- Advanced search
- Analytics dashboard enhancements
- International shipping

---

# 22. Assumptions & Constraints

## Assumptions
- Client will provide hosting infrastructure
- Razorpay account will be provided
- Product data will be provided by client
- Existing design will be implemented from Stitch

## Constraints
- No COD support
- Manual shipping workflow
- Single vendor architecture
- Variant-based inventory required

---

# 23. Conclusion

The Venus Essentials Ecommerce Platform is designed as a scalable, premium branded ecommerce solution focused on delivering a modern digital shopping experience while maintaining simplified administrative operations.

The platform architecture supports:
- Premium ecommerce experience
- Role-based administration
- Variant inventory management
- GST-compliant invoicing
- Secure online payments
- SEO optimization
- Future scalability

This SRS document shall serve as the primary functional and technical reference during the design, development, testing, and deployment phases of the project.

