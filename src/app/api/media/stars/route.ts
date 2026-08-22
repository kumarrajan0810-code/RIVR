import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/providers/tmdb/client";

export interface StarPerson {
  id: string;
  tmdbId: number;
  name: string;
  role: "FEATURING" | "FROM";
  type: "actor" | "director";
  knownFor: string;
  image: string;
  searchQuery: string;
}

export const STAR_POWER_LIST: StarPerson[] = [
  {
    id: "star-will-smith",
    tmdbId: 2888,
    name: "Will Smith",
    role: "FEATURING",
    type: "actor",
    knownFor: "Bad Boys, I Am Legend, Men in Black",
    image: "https://image.tmdb.org/t/p/w500/8TlKqbXYgHmmaEoPBJ7djJ8Rxxa.jpg",
    searchQuery: "Will Smith",
  },
  {
    id: "star-jennifer-aniston",
    tmdbId: 4491,
    name: "Jennifer Aniston",
    role: "FEATURING",
    type: "actor",
    knownFor: "Friends, The Morning Show, Murder Mystery",
    image: "https://image.tmdb.org/t/p/w500/PBSCmHDFdCMBhjx0EbXpTw4Z94.jpg",
    searchQuery: "Jennifer Aniston",
  },
  {
    id: "star-margot-robbie",
    tmdbId: 234352,
    name: "Margot Robbie",
    role: "FEATURING",
    type: "actor",
    knownFor: "Barbie, The Wolf of Wall Street, Babylon",
    image: "https://image.tmdb.org/t/p/w500/8LqG2N6j98lFGMpuYsRUAhOunSd.jpg",
    searchQuery: "Margot Robbie",
  },
  {
    id: "star-christopher-nolan",
    tmdbId: 525,
    name: "Christopher Nolan",
    role: "FROM",
    type: "director",
    knownFor: "Oppenheimer, Inception, Interstellar, The Dark Knight",
    image: "https://image.tmdb.org/t/p/w500/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg",
    searchQuery: "Christopher Nolan",
  },
  {
    id: "star-tom-hanks",
    tmdbId: 31,
    name: "Tom Hanks",
    role: "FEATURING",
    type: "actor",
    knownFor: "Forrest Gump, Cast Away, Saving Private Ryan",
    image: "https://image.tmdb.org/t/p/w500/oFvZoKI6lvU03n4YoNGAll9rkas.jpg",
    searchQuery: "Tom Hanks",
  },
  {
    id: "star-leonardo-dicaprio",
    tmdbId: 6193,
    name: "Leonardo DiCaprio",
    role: "FEATURING",
    type: "actor",
    knownFor: "Titanic, Inception, The Revenant, Shutter Island",
    image: "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
    searchQuery: "Leonardo DiCaprio",
  },
  {
    id: "star-zendaya",
    tmdbId: 505710,
    name: "Zendaya",
    role: "FEATURING",
    type: "actor",
    knownFor: "Dune, Euphoria, Spider-Man: No Way Home",
    image: "https://image.tmdb.org/t/p/w500/1qup8tSt95HLbcy2c2xrx4iJNxv.jpg",
    searchQuery: "Zendaya",
  },
  {
    id: "star-cillian-murphy",
    tmdbId: 2037,
    name: "Cillian Murphy",
    role: "FEATURING",
    type: "actor",
    knownFor: "Oppenheimer, Peaky Blinders, Inception",
    image: "https://image.tmdb.org/t/p/w500/2lKs67r7FI4bPu0AXxMUJZxmUXn.jpg",
    searchQuery: "Cillian Murphy",
  },
  {
    id: "star-keanu-reeves",
    tmdbId: 6384,
    name: "Keanu Reeves",
    role: "FEATURING",
    type: "actor",
    knownFor: "John Wick, The Matrix, Speed",
    image: "https://image.tmdb.org/t/p/w500/8RZLOyYGsoRe9p44q3xin9QkMHv.jpg",
    searchQuery: "Keanu Reeves",
  },
  {
    id: "star-quentin-tarantino",
    tmdbId: 138,
    name: "Quentin Tarantino",
    role: "FROM",
    type: "director",
    knownFor: "Pulp Fiction, Django Unchained, Kill Bill",
    image: "https://image.tmdb.org/t/p/w500/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg",
    searchQuery: "Quentin Tarantino",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  try {
    if (query && query.length > 0) {
      // Live search across TMDB for any actor or director in the world
      const results = await tmdbClient.searchPerson(query);
      if (results.length > 0) {
        return NextResponse.json({ stars: results });
      }
    }

    // Default: Return curated stars + live popular persons
    const popular = await tmdbClient.getPopularPersons(1);
    const combined = [...STAR_POWER_LIST];

    popular.forEach((p) => {
      if (!combined.some((c) => c.tmdbId === p.tmdbId)) {
        combined.push(p as StarPerson);
      }
    });

    return NextResponse.json({
      stars: combined,
    });
  } catch (err) {
    console.error("Error fetching stars:", err);
    return NextResponse.json({
      stars: STAR_POWER_LIST,
    });
  }
}
