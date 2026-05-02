(function() {
    if (document.getElementById('programNavbar')) return;
    
    const navbarContainer = document.createElement('div');
    navbarContainer.id = 'programNavbar';
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Get current user from localStorage or session
    let currentUser = null;
    try {
        const savedUser = localStorage.getItem('program_current_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        } else {
            // Try to get from main session
            const mainSession = localStorage.getItem('mcb_user_session') || sessionStorage.getItem('mcb_user_session');
            if (mainSession) {
                const sessionUser = JSON.parse(mainSession);
                currentUser = {
                    name: sessionUser.full_name,
                    email: sessionUser.email,
                    role: sessionUser.role,
                    profile_image: sessionUser.profile_image,
                    full_name: sessionUser.full_name,
                    id: sessionUser.id
                };
            } else {
                currentUser = {
                    name: 'Program Director',
                    email: 'program@mobilizationchurch.com',
                    role: 'program',
                    profile_image: null,
                    full_name: 'Program Ministry Director',
                    id: null
                };
            }
        }
    } catch(e) {
        currentUser = { name: 'Program Director', full_name: 'Program Ministry Director' };
    }
    
    const navItems = [
        { name: 'Home', icon: 'fas fa-home', link: 'index.html', active: currentPage === 'index.html' },
        { name: 'Add Program', icon: 'fas fa-plus-circle', link: 'add_program.html', active: currentPage === 'add_program.html' },
        { name: 'Table', icon: 'fas fa-table', link: 'table.html', active: currentPage === 'table.html' },
        { name: 'Monthly Schedule', icon: 'fas fa-calendar-alt', link: 'monthly_sched.html', active: currentPage === 'monthly_sched.html' },
        { name: 'Logout', icon: 'fas fa-sign-out-alt', link: 'logout.html', active: currentPage === 'logout.html' }
    ];
    
    navbarContainer.innerHTML = `
        <style>
            :root {
                --program-primary: #3b82f6;
                --program-dark: #1e3a8a;
                --program-light: #eff6ff;
            }
            
            .program-navbar {
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 15px rgba(0,0,0,0.08);
                position: sticky;
                top: 0;
                z-index: 1000;
                font-family: 'Inter', 'Segoe UI', sans-serif;
                border-bottom: 1px solid rgba(59, 130, 246, 0.2);
            }
            
            .program-navbar .navbar-brand {
                font-weight: 800;
                font-size: 1.3rem;
                color: var(--program-dark) !important;
                letter-spacing: -0.3px;
            }
            
            .program-navbar .navbar-brand i {
                color: var(--program-primary);
                margin-right: 8px;
            }
            
            .brand-subtitle {
                font-size: 0.6rem;
                color: #6b7280;
                letter-spacing: 0.5px;
            }
            
            .program-navbar .nav-link {
                color: #4b5563 !important;
                font-weight: 500;
                padding: 10px 18px;
                border-radius: 40px;
                transition: all 0.3s ease;
                margin: 0 2px;
            }
            
            .program-navbar .nav-link:hover {
                color: var(--program-primary) !important;
                background: var(--program-light);
            }
            
            .program-navbar .nav-link.active {
                color: var(--program-primary) !important;
                background: var(--program-light);
            }
            
            .program-navbar .nav-link i {
                margin-right: 8px;
            }
            
            /* Program Footer */
            .program-footer {
                background: #0f172a;
                color: #94a3b8;
                padding: 40px 0 20px;
                margin-top: 50px;
                font-size: 0.85rem;
            }
            
            .program-footer a {
                color: #94a3b8;
                text-decoration: none;
                transition: color 0.2s;
            }
            
            .program-footer a:hover {
                color: #3b82f6;
            }
            
            .program-footer .footer-link {
                margin: 0 12px;
                cursor: pointer;
            }
            
            .program-footer .social-icon {
                font-size: 1.2rem;
                margin: 0 10px;
                display: inline-block;
            }
            
            .footer-bottom {
                border-top: 1px solid #1e293b;
                padding-top: 20px;
                margin-top: 20px;
            }
            
            /* Modal Card Style */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(4px);
                z-index: 2000;
                display: none;
                justify-content: center;
                align-items: center;
            }
            
            .modal-overlay.show {
                display: flex;
            }
            
            .modal-card {
                background: white;
                border-radius: 1.5rem;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease;
            }
            
            @keyframes modalSlideIn {
                from { transform: translateY(-30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-header {
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                font-weight: 700;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #94a3b8;
                transition: color 0.2s;
            }
            
            .modal-close:hover {
                color: #dc2626;
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .modal-body img {
                width: 100%;
                border-radius: 1rem;
                margin-bottom: 1rem;
            }
            
            .modal-body p {
                color: #4b5563;
                line-height: 1.6;
            }
            
            /* ========== MOBILE BOTTOM BAR - EMOJI ONLY ========== */
            @media (max-width: 768px) {
                .program-navbar {
                    position: fixed;
                    bottom: 0;
                    top: auto;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 -2px 15px rgba(0,0,0,0.1);
                    padding: 0;
                    z-index: 1050;
                }
                
                .program-navbar .container {
                    width: 100%;
                    padding: 0;
                }
                
                .program-navbar .navbar-brand {
                    display: none;
                }
                
                .navbar-toggler {
                    display: none;
                }
                
                .navbar-collapse {
                    display: block !important;
                }
                
                .program-navbar .navbar-nav {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    width: 100%;
                    margin: 0;
                    padding: 6px 0;
                }
                
                .program-navbar .nav-item {
                    flex: 1;
                    text-align: center;
                    margin: 0;
                }
                
                .program-navbar .nav-link {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 6px 0;
                    margin: 0;
                    font-size: 0;
                    border-radius: 0;
                }
                
                /* Hide text labels on mobile - emoji only */
                .program-navbar .nav-link span {
                    display: none !important;
                }
                
                /* Show only icons with larger size */
                .program-navbar .nav-link i {
                    font-size: 1.8rem;
                    margin: 0;
                    padding: 0;
                }
                
                .program-navbar .nav-link.active {
                    background: rgba(59, 130, 246, 0.15);
                    color: var(--program-primary) !important;
                }
                
                /* Add extra padding to body for bottom bar */
                body {
                    padding-bottom: 65px !important;
                }
                
                /* Adjust footer margin */
                .program-footer {
                    margin-bottom: 0;
                    padding-bottom: 20px;
                }
            }
            
            /* Small phones */
            @media (max-width: 480px) {
                .program-navbar .nav-link i {
                    font-size: 1.6rem;
                }
                
                body {
                    padding-bottom: 60px !important;
                }
            }
            
            /* Desktop retains original layout with text */
            @media (min-width: 769px) {
                .program-navbar .nav-link span {
                    display: inline;
                }
                
                .program-navbar .nav-link i {
                    font-size: 1rem;
                    margin-right: 8px;
                }
            }
        </style>
        
        <nav class="program-navbar navbar navbar-expand-md">
            <div class="container">
                <a class="navbar-brand" href="index.html">
                    <i class="fas fa-calendar-alt"></i>
                    <div class="d-inline-block">
                        <span>Program Ministry</span>
                        <div class="brand-subtitle">Mobilization Church Balilihan</div>
                    </div>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#programNavbarContent">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="programNavbarContent">
                    <ul class="navbar-nav mx-auto mb-2 mb-md-0">
                        ${navItems.map(item => `
                            <li class="nav-item">
                                <a class="nav-link ${item.active ? 'active' : ''}" href="${item.link}">
                                    <i class="${item.icon}"></i>
                                    <span>${item.name}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </nav>
    `;
    
    document.body.insertBefore(navbarContainer, document.body.firstChild);
    
    // Footer
    const footerContainer = document.createElement('div');
    footerContainer.id = 'programFooter';
    footerContainer.innerHTML = `
        <footer class="program-footer">
            <div class="container">
                <div class="row">
                    <div class="col-md-6 mb-4 mb-md-0">
                        <h6 class="text-white fw-bold mb-3"><i class="fas fa-calendar-alt me-2 text-primary"></i>Program Ministry</h6>
                        <p class="small">The Program Ministry is dedicated to organizing meaningful worship services, events, and activities that draw people closer to God and strengthen the faith community of Mobilization Church Balilihan.</p>
                    </div>
                    <div class="col-md-3 mb-4 mb-md-0">
                        <h6 class="text-white fw-bold mb-3">Quick Links</h6>
                        <ul class="list-unstyled small">
                            <li><a href="index.html"><i class="fas fa-home me-2"></i>Home</a></li>
                            <li><a href="add_program.html"><i class="fas fa-plus-circle me-2"></i>Add Program</a></li>
                            <li><a href="table.html"><i class="fas fa-table me-2"></i>Program Table</a></li>
                            <li><a href="monthly_sched.html"><i class="fas fa-calendar-alt me-2"></i>Monthly Schedule</a></li>
                        </ul>
                    </div>
                    <div class="col-md-3">
                        <h6 class="text-white fw-bold mb-3">Connect With Us</h6>
                        <div class="mb-3">
                            <a href="#" class="social-icon" data-social="facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="social-icon" data-social="instagram"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="social-icon" data-social="tiktok"><i class="fab fa-tiktok"></i></a>
                            <a href="#" class="social-icon" data-social="email"><i class="fas fa-envelope"></i></a>
                        </div>
                        <p class="small mb-0"><i class="fas fa-phone-alt me-2"></i>+63 938 244 7968</p>
                        <p class="small"><i class="fas fa-map-marker-alt me-2"></i>Balilihan, Bohol, Philippines</p>
                    </div>
                </div>
                <div class="footer-bottom text-center">
                    <p class="mb-0 small">© 2026 Mobilization Church Balilihan. All rights reserved.</p>
                    <p class="mb-0 small mt-2">
                        <a class="footer-link" onclick="showModalCard('about')">About</a> | 
                        <a class="footer-link" onclick="showModalCard('contact')">Contact</a> | 
                        <a class="footer-link" onclick="showModalCard('privacy')">Privacy Regulations</a>
                    </p>
                </div>
            </div>
        </footer>
    `;
    document.body.appendChild(footerContainer);
    
    // Modal HTML
    const modalHTML = `
        <div id="infoModal" class="modal-overlay">
            <div class="modal-card">
                <div class="modal-header">
                    <h3 id="modalTitle">About</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body" id="modalBody">
                    <img id="modalImage" src="" alt="Info">
                    <p id="modalText"></p>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Modal content configurations
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
    
    window.showModalCard = function(type) {
        const content = modalContent[type];
        if (content) {
            document.getElementById('modalTitle').innerHTML = content.title;
            document.getElementById('modalImage').src = content.image;
            document.getElementById('modalText').innerHTML = content.text;
            document.getElementById('infoModal').classList.add('show');
        }
    };
    
    window.closeModal = function() {
        document.getElementById('infoModal').classList.remove('show');
    };
    
    // Close modal when clicking outside
    document.getElementById('infoModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    // Social media links
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
    
    function loadResources() {
        const loadCSS = (href) => {
            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
            }
        };
        loadCSS('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
        loadCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        
        if (typeof bootstrap === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
            document.head.appendChild(script);
        }
    }
    loadResources();
    
    console.log("✅ Program Ministry Navbar loaded — Desktop: text + icons, Mobile: emoji only bottom bar, Profile dropdown removed");
})();
