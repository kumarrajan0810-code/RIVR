// AniList GraphQL Queries
export const ANIME_SEARCH_QUERY = `
query ($search: String, $page: Int, $perPage: Int, $genre: String, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(search: $search, genre: $genre, type: ANIME, sort: $sort, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      description(asHtml: false)
      coverImage {
        extraLarge
        large
        medium
      }
      bannerImage
      format
      episodes
      duration
      status
      startDate {
        year
        month
        day
      }
      averageScore
      popularity
      favourites
      genres
      studios(isMain: true) {
        nodes {
          id
          name
        }
      }
    }
  }
}
`;

export const ANIME_DETAILS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    idMal
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      extraLarge
      large
      medium
    }
    bannerImage
    format
    episodes
    duration
    status
    startDate {
      year
      month
      day
    }
    averageScore
    popularity
    favourites
    genres
    studios(isMain: true) {
      nodes {
        id
        name
      }
    }
    characters(sort: ROLE, perPage: 12) {
      edges {
        role
        node {
          id
          name {
            full
          }
          image {
            medium
          }
        }
      }
    }
    recommendations(perPage: 10, sort: RATING_DESC) {
      nodes {
        mediaRecommendation {
          id
          idMal
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          bannerImage
          format
          averageScore
          genres
          startDate {
            year
          }
        }
      }
    }
  }
}
`;
