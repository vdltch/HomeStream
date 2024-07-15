$(document).ready(function() {
    $('#searchButton').on('click', function() {
      const query = $('#searchInput').val();
      if (query) {
        fetch(`https://api.themoviedb.org/3/search/multi?api_key=306f6942218ce08831a4ee6bccca2454&query=${query}`)
          .then(response => response.json())
          .then(data => {
            const resultDiv = $('#result');
            resultDiv.empty();
            data.results.forEach(item => {
              const id = item.id;
              const title = item.title || item.name;
              const overview = item.overview || 'Pas de description disponible';
              const posterPath = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'images/placeholder.png';
              const resultItem = `
                <div class="result-item card" data-id="${id}">
                  <img src="${posterPath}" class="card-img-top" alt="${title}">
                  <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${overview}</p>
                    <button class="btn btn-primary btn-like">Like</button>
                    <button class="btn btn-secondary btn-fav">Favoris</button>
                  </div>
                </div>
              `;
              resultDiv.append(resultItem);
            });
  
            // Ajouter des gestionnaires d'événements pour les boutons de like et de favoris
            $('.btn-like').on('click', function() {
              const id = $(this).closest('.result-item').data('id');
              likeItem(id);
            });
  
            $('.btn-fav').on('click', function() {
              const id = $(this).closest('.result-item').data('id');
              addFavorite(id);
            });
          })
          .catch(error => {
            console.error('Erreur:', error);
          });
      }
    });
  
    function likeItem(id) {
      chrome.storage.local.get(['likes'], function(result) {
        let likes = result.likes || [];
        if (!likes.includes(id)) {
          likes.push(id);
          chrome.storage.local.set({likes: likes}, function() {
            alert('Item liked!');
          });
        } else {
          alert('Item already liked.');
        }
      });
    }
  
    function addFavorite(id) {
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=306f6942218ce08831a4ee6bccca2454`)
          .then(response => response.json())
          .then(item => {
            const title = item.title || item.name;
      
            searchOnRadarr(id);
            hrome.storage.local.get(['favorites'], function(result) {
                let favorites = result.favorites || [];
                if (!favorites.some(fav => fav.id === id)) {
                  favorites.push({
                    id: id,
                    title: title,
                    // Ajoutez d'autres propriétés si nécessaire
                  });
                  chrome.storage.local.set({favorites: favorites}, function() {
                    alert('Item added to favorites!');
                    displayFavorites();
                  });
                } else {
                  alert('Item already in favorites.');
                }
              });
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }

    function searchOnRadarr(id) {
        const url = `http://82.67.36.31:7878/api/movie/lookup/tmdb?tmdbId=${id}`;
      
        $.ajax({
          url: url,
          type: 'GET',
          headers: {
            'Authorization': 'Bearer d14a2fd184464c1fa057cd86d5f87c1c'
          },
          success: function(response) {
            if (response && response.tmdbId === id) {
              const radarrUrl = `http://82.67.36.31:7878/movie/${response.id}`;
              window.open(radarrUrl, '_blank');
            } else {
              alert('Aucun résultat trouvé sur Radarr.');
            }
          },
          error: function(xhr, status, error) {
            console.error('Erreur lors de la requête vers Radarr:', error);
            alert('Erreur lors de la recherche sur Radarr.');
          }
        });
      }

    function removeFavorite(id) {
      chrome.storage.local.get(['favorites'], function(result) {
        let favorites = result.favorites || [];
        if (favorites.includes(id)) {
          favorites = favorites.filter(fav => fav !== id);
          chrome.storage.local.set({favorites: favorites}, function() {
            alert('Item removed from favorites.');
            displayFavorites();
          });
        } else {
          alert('Item not found in favorites.');
        }
      });
    }
});  