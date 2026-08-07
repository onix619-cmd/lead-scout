/**
 * restaurantTemplate.ts
 * --------------------
 * Re‑usable master layout for a restaurant landing page.
 * Built with Tailwind‑CSS utilities and pure HTML.
 *
 * Place‑holder syntax: {{variable}}  (Mustache‑style)
 *   • {{restaurant_name}}
 *   • {{address}}
 *   • {{phone}}
 *   • {{email}}
 *   • {{hero_image_url}}
 *   • {{hero_tagline}}
 *   • {{about_text}}
 *   • {{menu_items}}   – an array of objects (see MenuItem interface)
 *
 * The file exports:
 *   1️⃣ `template` – the raw HTML string (you can feed it to any
 *       templating engine – e.g. Mustache, Handlebars, EJS, etc.).
 *   2️⃣ `render(data)` – a **very small** built‑in renderer that
 *       replaces the placeholders with the supplied data.
 *
 * ------------------------------------------------------------------- */

export interface MenuItem {
  /** URL to the dish picture (publicly accessible) */
  image: string;
  /** Dish name */
  name: string;
  /** Short description */
  description: string;
  /** Formatted price string, e.g. "$14.99" */
  price: string;
}

/** Shape of the whole data object the template expects */
export interface RestaurantData {
  restaurant_name: string;
  address: string;
  phone: string;
  email: string;
  hero_image_url: string;
  hero_tagline: string;
  about_text: string;
  /** Optional – if you want to show a custom CTA button */
  cta_label?: string;
  cta_target?: string; // anchor id or URL
  menu_items: MenuItem[];
}

/* -------------------------------------------------------------------
 * 1️⃣  THE RAW TEMPLATE
 * ------------------------------------------------------------------- */
export const template = /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{restaurant_name}} – {{hero_tagline}}</title>

  <!-- Tailwind CDN – replace with a compiled CSS file for prod -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#D4A373',   /* brand accent – adjust in your config */
            secondary: '#2C2C2C',
          },
        },
      },
    };
  </style>
</head>

<body class="bg-gray-50 text-gray-900 antialiased font-sans">

  <!-- ====================== HEADER / NAV ====================== -->
  <header class="sticky top-0 z-30 bg-white shadow-sm">
    <nav class="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-8">
      <a href="/" class="text-2xl font-bold text-primary">
        {{restaurant_name}}
      </a>

      <!-- Desktop navigation -->
      <ul class="hidden md:flex space-x-8 text-base font-medium">
        <li><a href="#hero" class="hover:text-primary transition">Home</a></li>
        <li><a href="#menu" class="hover:text-primary transition">Menu</a></li>
        <li><a href="#about" class="hover:text-primary transition">About</a></li>
        <li><a href="#contact" class="hover:text-primary transition">Contact</a></li>
      </ul>

      <!-- Mobile hamburger -->
      <button id="mobile-menu-btn"
              class="md:hidden flex items-center focus:outline-none"
              aria-label="Toggle menu">
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor"
             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </nav>

    <!-- Mobile menu – hidden by default -->
    <div id="mobile-menu"
         class="hidden md:hidden bg-white border-t border-gray-200">
      <ul class="flex flex-col space-y-2 p-4 text-lg font-medium">
        <li><a href="#hero" class="block hover:text-primary">Home</a></li>
        <li><a href="#menu" class="block hover:text-primary">Menu</a></li>
        <li><a href="#about" class="block hover:text-primary">About</a></li>
        <li><a href="#contact" class="block hover:text-primary">Contact</a></li>
      </ul>
    </div>
  </header>

  <!-- ====================== HERO ====================== -->
  <section id="hero"
           class="relative bg-cover bg-center bg-no-repeat"
           style="background-image: url('{{hero_image_url}}');">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="max-w-4xl mx-auto text-center px-4 py-32 relative z-10">
      <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
        {{restaurant_name}}
      </h1>
      <p class="text-lg md:text-xl text-gray-200 mb-8 drop-shadow-md">
        {{hero_tagline}}
      </p>
      <a href="{{cta_target ?? '#contact'}}"
         class="inline-block bg-primary text-white font-semibold py-3 px-6 rounded-md hover:bg-primary/90 transition">
        {{cta_label ?? 'Reserve a Table'}}
      </a>
    </div>
  </section>

  <!-- ====================== MENU ====================== -->
  <section id="menu" class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <h2 class="text-3xl font-bold text-center mb-12 text-secondary">
        Our Menu
      </h2>

      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {{#menu_items}}
        <article class="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
          <img src="{{image}}" alt="{{name}}" class="w-full h-48 object-cover">
          <div class="p-6">
            <h3 class="text-xl font-semibold text-secondary mb-2">{{name}}</h3>
            <p class="text-gray-600 mb-3">{{description}}</p>
            <p class="text-primary font-bold text-lg">{{price}}</p>
          </div>
        </article>
        {{/menu_items}}
      </div>
    </div>
  </section>

  <!-- ====================== ABOUT ====================== -->
  <section id="about" class="py-20 bg-gray-100">
    <div class="max-w-3xl mx-auto px-4 md:px-8 text-center">
      <h2 class="text-3xl font-bold text-secondary mb-6">Our Story</h2>
      <p class="text-lg text-gray-700 leading-relaxed">
        {{about_text}}
      </p>
    </div>
  </section>

  <!-- ====================== CONTACT / FOOTER ====================== -->
  <section id="contact" class="py-20 bg-white">
    <div class="max-w-4xl mx-auto px-4 md:px-8">
      <h2 class="text-3xl font-bold text-center text-secondary mb-8">Contact Us</h2>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Contact details -->
        <div class="space-y-4">
          <p class="flex items-center text-gray-800">
            <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="
