// ✅ No API key needed (Inshorts API)
const BASE_URL = "https://inshortsapi.vercel.app/news?category=";

// DOM Elements
const locationDisplay = document.getElementById("location-display");
const newsContainer = document.getElementById("news-container");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const categoryButtons = document.querySelectorAll(".category-btn");

// Default category for homepage
let userLocationCategory = "national";

// 1) Detect Location and map to news category
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

// 2) Fetch News and auto fallback if empty
async function fetchAndRenderNews(category) {
    newsContainer.innerHTML = `<p class="loading-text">Fetching news...</p>`;

    const validCategories = [
        "national","world","technology","business","sports",
        "entertainment","science","health","startup","automobile","politics"
    ];

    // If user searched something not in categories → fallback to world
    if (!validCategories.includes(category.toLowerCase())) {
        category = "world";
    }

    const url = BASE_URL + category.toLowerCase();

    try {
        const res = await fetch(url);
        const data = await res.json();

        // If API response is empty → fallback to national news
        if (!data.data || data.data.length === 0) {
            return fetchAndRenderNews("national");
        }

        renderNews(data.data);

    } catch (error) {
        newsContainer.innerHTML = `<p class="loading-text">⚠️ Failed to load news.</p>`;
    }
}

// 3) Display the News Cards
function renderNews(articles) {
    newsContainer.innerHTML = "";

    articles.forEach((article, index) => {
        const card = document.createElement("div");
        card.className = "news-card";
        card.style.transitionDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <img class="news-card-image" src="${article.imageUrl}"
                onerror="this.src='https://via.placeholder.com/400x200?text=No+Image';">

            <div class="news-card-content">
                <span class="news-source">${article.author || "Source"}</span>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.content || ""}</p>
                <a href="${article.readMoreUrl}" target="_blank" class="read-more-btn">Read More</a>
            </div>
        `;

        newsContainer.appendChild(card);
        setTimeout(() => card.classList.add("loaded"), 10);
    });
}

// 4) Search Functionality
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) fetchAndRenderNews(query);
});
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchButton.click();
});

// 5) Category Filters
categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        fetchAndRenderNews(button.dataset.category);
        searchInput.value = "";
    });
});

// 6) App Start
document.addEventListener("DOMContentLoaded", async () => {
    await detectLocation();
    fetchAndRenderNews(userLocationCategory);
});
