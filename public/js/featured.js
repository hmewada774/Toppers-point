// Featured section functionality
document.addEventListener('DOMContentLoaded', function() {
    // Sample featured data (replace with your actual data or API call)
    const featuredData = [
        {
            title: 'Expert Faculty',
            description: 'Learn from experienced educators with years of teaching experience.',
            icon: 'fa-chalkboard-teacher',
            delay: '100'
        },
        {
            title: 'Personalized Attention',
            description: 'Small batch sizes ensure individual attention to every student.',
            icon: 'fa-user-graduate',
            delay: '200'
        },
        {
            title: 'Regular Tests',
            description: 'Weekly tests to track progress and improve performance.',
            icon: 'fa-clipboard-check',
            delay: '300'
        },
        {
            title: 'Study Materials',
            description: 'Comprehensive study materials and practice papers provided.',
            icon: 'fa-book',
            delay: '400'
        },
        {
            title: 'Doubt Solving',
            description: 'Regular doubt solving sessions for better understanding.',
            icon: 'fa-question-circle',
            delay: '500'
        },
        {
            title: 'Performance Reports',
            description: 'Detailed performance analysis and progress reports.',
            icon: 'fa-chart-line',
            delay: '600'
        }
    ];

    // Function to create featured cards
    function createFeaturedCards() {
        const featuresContainer = document.querySelector('.features-section .grid-3');
        
        if (!featuresContainer) return;

        // Clear existing content
        featuresContainer.innerHTML = '';

        // Create and append cards
        featuredData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card feature-card';
            card.style.animationDelay = `${item.delay}ms`;
            
            card.innerHTML = `
                <div class="feature-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            `;
            
            featuresContainer.appendChild(card);
        });
    }

    // Initialize featured section
    createFeaturedCards();

    // Add animation classes when elements come into view
    const animateOnScroll = () => {
        const cards = document.querySelectorAll('.feature-card');
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight - 100) {
                card.classList.add('fade-in');
            }
        });
    };

    // Initial check
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);
});
