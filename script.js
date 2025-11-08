// ✅ Inshorts API (No API Key Required)
const BASE_URL = "https://inshortsapi.vercel.app/news?category=";

// DOM Elements
const locationDisplay = document.getElementById('location-display');
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const categoryButtons = document.querySelectorAll('.category-btn');

let userLocationCategory = "national"; // Default (India users get Indian news first)

// 1) Detect Location → map location to category
async function detectLocation() {
    try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        locationDisplay.textContent = `📍 ${data.city}, ${data.country}`;

        const country = data.country.toLowerCase();
        if (country.includes("india")) userLocationCategory = "national";
        else userLocationCategory = "world";

    } catch {
        locationDisplay.textContent = "📍 Using Global News";
        userLocationCategory = "world";
    }
}

// 2) Fetch + Display News
async function fetchAndRenderNews(category) {
    newsContainer.innerHTML = `<p class="loading-text">Fetching news...</p>`;

    const url = BASE_URL + category.toLowerCase();

    try {
        const res = await fetch(url);
        const data = await res.json();
        renderNews(data.data);

    } catch (error) {
        newsContainer.innerHTML = `<p class="loading-text">⚠️ Failed to load news.</p>`;
    }
}

// 3) Create News Cards
function renderNews(articles) {
    newsContainer.innerHTML = "";

    articles.forEach((article, index) => {
        const card = document.createElement("div");
        card.className = "news-card";
        card.style.transitionDelay = `${index * 0.06}s`;

        card.innerHTML = `
            <img class="news-card-image" src="${article.imageUrl}"
                onerror="this.src='https://via.placeholder.com/400x200?text=No+Image';">

            <div class="news-card-content">
                <span class="news-source">${article.author || "Source"}</span>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.content}</p>
                <a href="${article.readMoreUrl}" target="_blank" class="read-more-btn">Read More</a>
            </div>
        `;
        newsContainer.appendChild(card);

        setTimeout(() => card.classList.add("loaded"), 10);
    });
}

// 4) Search → maps search to category
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) fetchAndRenderNews(query);
});
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchButton.click();
});

// 5) Category Buttons
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        fetchAndRenderNews(button.dataset.category);
        searchInput.value = "";
    });
});

// Start App
document.addEventListener("DOMContentLoaded", async () => {
    await detectLocation();
    fetchAndRenderNews(userLocationCategory);
});
