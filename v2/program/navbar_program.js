(function () {
  if (document.getElementById('programNavbar')) return;

  // ================== USER DETECTION ==================
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  let currentUser = { name: 'Program Director', full_name: 'Program Ministry Director' };
  try {
    const savedUser = localStorage.getItem('program_current_user');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    } else {
      const mainSession = localStorage.getItem('mcb_user_session') || sessionStorage.getItem('mcb_user_session');
      if (mainSession) {
        const sessionUser = JSON.parse(mainSession);
        currentUser = {
          name: sessionUser.full_name,
          email: sessionUser.email,
          role: sessionUser.role,
          profile_image: sessionUser.profile_image,
          full_name: sessionUser.full_name,
          id: sessionUser.id,
        };
      }
    }
  } catch (e) {
    currentUser = { name: 'Program Director', full_name: 'Program Ministry Director' };
  }

  // ================== NAV ITEMS ==================
  const navItems = [
    { name: 'Home', icon: 'fa-solid fa-house', link: 'index.html', active: currentPage === 'index.html' },
    { name: 'Add', icon: 'fa-solid fa-plus-circle', link: 'add_program.html', active: currentPage === 'add_program.html' },
    { name: 'Table', icon: 'fa-solid fa-table', link: 'table.html', active: currentPage === 'table.html' },
    { name: 'Schedule', icon: 'fa-solid fa-calendar-alt', link: 'monthly_sched.html', active: currentPage === 'monthly_sched.html' },
    { name: 'Logout', icon: 'fa-solid fa-right-from-bracket', link: 'logout.html', active: currentPage === 'logout.html' },
  ];

  // ================== BUILD NAVBAR ==================
  const navbarContainer = document.createElement('div');
  navbarContainer.id = 'programNavbar';
  navbarContainer.className = 'sticky top-0 z-50 font-sans';

  navbarContainer.innerHTML = `
    <!-- Desktop Navbar (dark glass) -->
    <nav class="hidden md:flex items-center justify-between px-6 py-3 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-lg shadow-black/20">
      <!-- Brand -->
      <a href="index.html" class="flex items-center gap-2 text-white no-underline group">
        <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
          <i class="fa-solid fa-calendar-alt text-white text-lg"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-extrabold text-base tracking-tight">Program Ministry</span>
          <span class="text-xs text-gray-400">MCB Balilihan</span>
        </div>
      </a>

      <!-- Center Nav Links -->
      <ul class="flex items-center gap-0">
        ${navItems.map(item => `
          <li>
            <a href="${item.link}" class="relative flex items-center gap-2 px-4 py-2 mx-1 rounded-full text-sm font-semibold transition-all duration-200
              ${item.active 
                ? 'text-white bg-blue-600/30 shadow-[0_0_10px_rgba(59,130,246,0.4)]' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800/60 hover:shadow-[0_0_8px_rgba(59,130,246,0.15)]'
              }">
              <i class="${item.icon} text-base"></i>
              <span>${item.name}</span>
              ${item.active ? '<span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-400 rounded-full"></span>' : ''}
            </a>
          </li>
        `).join('')}
      </ul>

      <!-- Right: User greeting -->
      <div class="flex items-center gap-3 text-sm">
        <div class="text-right">
          <p class="text-white font-medium leading-tight">${escapeHtml(currentUser.full_name)}</p>
          <p class="text-xs text-gray-400">Program Director</p>
        </div>
        <img src="${currentUser.profile_image || 'https://ui-avatars.com/api/?name=PD&background=3b82f6&color=fff&size=32&bold=true&rounded=true'}" 
             alt="User" class="w-8 h-8 rounded-full object-cover border-2 border-blue-400/50 shadow-md"
             onerror="this.src='https://ui-avatars.com/api/?name=PD&background=3b82f6&color=fff&size=32&bold=true&rounded=true'">
      </div>
    </nav>

    <!-- Mobile Bottom Bar (labeled icons) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/70 z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.3)]">
      <ul class="flex justify-around items-center py-2 px-1">
        ${navItems.map(item => `
          <li class="flex-1">
            <a href="${item.link}" class="flex flex-col items-center justify-center py-1 no-underline transition-colors ${item.active ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}">
              <i class="${item.icon} text-xl mb-0.5"></i>
              <span class="text-[10px] font-medium">${item.name}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>

    <!-- Padding for mobile bottom bar -->
    <div class="md:hidden h-16"></div>
  `;

  document.body.prepend(navbarContainer);

  if (window.innerWidth < 768) {
    document.body.style.paddingBottom = '70px';
  }

  // ================== FOOTER (dark, different grid) ==================
  const footerContainer = document.createElement('div');
  footerContainer.id = 'programFooter';
  footerContainer.className = 'bg-gray-950 text-gray-400 text-sm mt-12 border-t border-gray-800';
  footerContainer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div>
        <h6 class="text-white font-bold text-lg mb-3 flex items-center gap-2">
          <i class="fa-solid fa-calendar-alt text-blue-500"></i> Program Ministry
        </h6>
        <p class="leading-relaxed text-xs">Organizing meaningful worship services, events, and activities that draw people closer to God and strengthen the faith community of Mobilization Church Balilihan.</p>
      </div>
      <div>
        <h6 class="text-white font-bold mb-3 text-sm">Quick Links</h6>
        <ul class="space-y-1.5 text-xs">
          <li><a href="index.html" class="hover:text-blue-400 transition-colors"><i class="fa-solid fa-house mr-2"></i>Home</a></li>
          <li><a href="add_program.html" class="hover:text-blue-400 transition-colors"><i class="fa-solid fa-plus-circle mr-2"></i>Add Program</a></li>
          <li><a href="table.html" class="hover:text-blue-400 transition-colors"><i class="fa-solid fa-table mr-2"></i>Program Table</a></li>
          <li><a href="monthly_sched.html" class="hover:text-blue-400 transition-colors"><i class="fa-solid fa-calendar-alt mr-2"></i>Monthly Schedule</a></li>
        </ul>
      </div>
      <div>
        <h6 class="text-white font-bold mb-3 text-sm">Connect With Us</h6>
        <div class="flex gap-3 mb-3 text-lg">
          <a href="#" data-social="facebook" class="hover:text-blue-400 transition-colors"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" data-social="instagram" class="hover:text-pink-400 transition-colors"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" data-social="tiktok" class="hover:text-white transition-colors"><i class="fa-brands fa-tiktok"></i></a>
          <a href="#" data-social="email" class="hover:text-blue-400 transition-colors"><i class="fa-solid fa-envelope"></i></a>
        </div>
        <p class="mb-1 text-xs"><i class="fa-solid fa-phone-alt mr-2"></i>+63 938 244 7968</p>
        <p class="text-xs"><i class="fa-solid fa-map-marker-alt mr-2"></i>Balilihan, Bohol, Philippines</p>
      </div>
      <div>
        <h6 class="text-white font-bold mb-3 text-sm">Info</h6>
        <ul class="space-y-1.5 text-xs">
          <li><a href="#" onclick="showModalCard('about')" class="hover:text-blue-400 transition-colors">About Us</a></li>
          <li><a href="#" onclick="showModalCard('contact')" class="hover:text-blue-400 transition-colors">Contact</a></li>
          <li><a href="#" onclick="showModalCard('privacy')" class="hover:text-blue-400 transition-colors">Privacy</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
      <p>© 2026 Mobilization Church Balilihan. All rights reserved.</p>
    </div>
  `;
  document.body.appendChild(footerContainer);

  // ================== MODAL ==================
  const modalHTML = `
    <div id="infoModal" class="fixed inset-0 bg-black/60 backdrop-blur-md hidden items-center justify-center z-[2000] p-4" onclick="if(event.target===this) closeModal()">
      <div class="bg-gray-900 text-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-700 animate-slide-in">
        <div class="flex justify-between items-center p-5 border-b border-gray-700">
          <h3 id="modalTitle" class="font-bold text-lg"></h3>
          <button onclick="closeModal()" class="text-2xl text-gray-400 hover:text-red-400 transition-colors">&times;</button>
        </div>
        <div class="p-5">
          <img id="modalImage" src="" alt="Info" class="w-full rounded-xl mb-4">
          <p id="modalText" class="text-gray-300 leading-relaxed"></p>
        </div>
      </div>
    </div>
    <style>
      .animate-slide-in {
        animation: slideIn 0.3s ease forwards;
      }
      @keyframes slideIn {
        from { transform: translateY(-20px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
    </style>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modalContent = {
    about: {
      title: "⛪ About Program Ministry",
      image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&h=250&fit=crop",
      text: "The Program Ministry of Mobilization Church Balilihan is responsible for planning, organizing, and executing all church events, worship services, fellowships, and outreach programs. We strive to create meaningful experiences that glorify God and edify believers. Our team works diligently to ensure every service runs smoothly, from sound systems to service flow, creating an atmosphere where people can encounter God's presence."
    },
    contact: {
      title: "📞 Contact Program Ministry",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=250&fit=crop",
      text: "Reach out to our Program Ministry team for any inquiries about church events, service schedules, or program collaborations. You can contact us via email at program@mobilizationchurch.com or call us at +63 938 244 7968. Visit our church office at Sal-ing, Balilihan, Bohol from Monday to Friday, 9:00 AM to 5:00 PM. We look forward to serving you and working together for God's kingdom."
    },
    privacy: {
      title: "🔒 Privacy Regulations",
      image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=500&h=250&fit=crop",
      text: "The Program Ministry strictly adheres to data privacy regulations under the Data Privacy Act of 2012 (Republic Act No. 10173). All personal information collected from church members, volunteers, and event participants is kept confidential and used solely for church-related activities. We do not share, sell, or distribute any personal data to third parties. For concerns regarding your data, please contact our Data Protection Officer at mobilizationchurchb@gmail.com."
    }
  };

  window.showModalCard = function (type) {
    const content = modalContent[type];
    if (content) {
      document.getElementById('modalTitle').textContent = content.title;
      document.getElementById('modalImage').src = content.image;
      document.getElementById('modalText').textContent = content.text;
      document.getElementById('infoModal').classList.remove('hidden');
      document.getElementById('infoModal').classList.add('flex');
    }
  };

  window.closeModal = function () {
    const modal = document.getElementById('infoModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  // Social links
  document.querySelectorAll('[data-social]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const platform = el.getAttribute('data-social');
      let url = '#';
      if (platform === 'facebook') url = 'https://facebook.com/mobilizationchurch';
      else if (platform === 'instagram') url = 'https://instagram.com/mobilizationchurch';
      else if (platform === 'tiktok') url = 'https://tiktok.com/@mobilizationchurch';
      else if (platform === 'email') url = 'mailto:program@mobilizationchurch.com';
      window.open(url, '_blank');
    });
  });

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Load Font Awesome if not already present
  const faLink = document.createElement('link');
  faLink.rel = 'stylesheet';
  faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  if (!document.querySelector('link[href="' + faLink.href + '"]')) {
    document.head.appendChild(faLink);
  }

  console.log('✅ New Program Ministry Navbar (Dark Glass) loaded — modern, distinct design with labeled mobile bar.');
})();
