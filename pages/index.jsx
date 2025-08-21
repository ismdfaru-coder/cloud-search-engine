<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperSearch Engine</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f0f0;
            margin: 0;
        }
        .logo {
            max-width: 272px;
            width: 100%;
            height: auto;
            margin-bottom: 20px;
        }
        .search-container {
            width: 100%;
            max-width: 600px;
            text-align: center;
        }
        .search-input-container {
            display: flex;
            align-items: center;
            border: 1px solid #ccc;
            border-radius: 25px;
            padding: 8px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .search-input {
            flex-grow: 1;
            border: none;
            outline: none;
            font-size: 16px;
        }
        .search-buttons {
            margin-top: 15px;
        }
        .search-buttons button {
            background-color: #f8f8f8;
            border: 1px solid #ccc;
            padding: 8px 16px;
            margin: 0 5px;
            cursor: pointer;
            font-size: 14px;
        }
        .search-buttons button:hover {
            background-color: #e0e0e0;
        }
        .results {
            width: 100%;
            max-width: 600px;
            margin-top: 20px;
        }
        .result-item {
            margin-bottom: 15px;
        }
        .result-item a {
            color: #1a0dab;
            text-decoration: none;
            font-size: 18px;
        }
        .result-item a:hover {
            text-decoration: underline;
        }
        .result-item .url {
            color: #006621;
            font-size: 14px;
        }
        .result-item .snippet {
            color: #333;
            font-size: 14px;
        }
        .message {
            font-size: 14px;
            margin-top: 10px;
        }
        .error {
            color: red;
        }
        .loading {
            color: #333;
        }
    </style>
</head>
<body>
    <main>
        <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Search Logo" class="logo">
        <div class="search-container">
            <div class="search-input-container">
                <input type="text" id="search-input" class="search-input" placeholder="Search the web">
            </div>
            <div class="search-buttons">
                <button id="search-button">Search</button>
                <button id="lucky-button">I'm Feeling Lucky</button>
            </div>
        </div>
        <div id="search-results" class="results"></div>
    </main>
    <script>
        console.log('Script loaded');
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        const searchResults = document.getElementById('search-results');
        const luckyButton = document.getElementById('lucky-button');
        const apiUrl = 'https://your-search-api.vercel.app/search'; // Replace with your Vercel API URL after deployment

        function showMessage(message, isError = false) {
            console.log(isError ? 'Error:' : 'Message:', message);
            searchResults.innerHTML = `<p class="${isError ? 'error' : 'loading'} message">${message}</p>`;
        }

        function displayResults(results) {
            console.log('Displaying results:', results);
            searchResults.innerHTML = '';
            if (results.length === 0) {
                showMessage('No results found.');
                return;
            }
            results.forEach(item => {
                const div = document.createElement('div');
                div.className = 'result-item';
                div.innerHTML = `
                    <a href="${item.link}" target="_blank">${item.title}</a>
                    <p class="url">${item.url}</p>
                    <p class="snippet">${item.snippet}</p>
                `;
                searchResults.appendChild(div);
            });
        }

        async function searchWeb(query) {
            console.log('Searching for:', query);
            try {
                const response = await fetch(`${apiUrl}?q=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('API request failed');
                const results = await response.json();
                return results;
            } catch (error) {
                console.error('Search error:', error);
                showMessage('Error fetching results.', true);
                return [];
            }
        }

        searchButton.addEventListener('click', async () => {
            console.log('Search button clicked');
            alert('Search button clicked! Processing query...');
            const query = searchInput.value.trim();
            if (!query) {
                showMessage('Please enter a search query.', true);
                return;
            }
            showMessage('Loading...');
            const results = await searchWeb(query);
            displayResults(results);
        });

        luckyButton.addEventListener('click', async () => {
            console.log('Lucky button clicked');
            alert('Lucky button clicked! Processing query...');
            const query = searchInput.value.trim();
            if (!query) {
                showMessage('Please enter a search query.', true);
                return;
            }
            showMessage('Loading...');
            const results = await searchWeb(query);
            if (results.length > 0) {
                window.location.href = results[0].link;
            } else {
                showMessage('No results found for "I\'m Feeling Lucky".');
            }
        });
    </script>
</body>
</html>
