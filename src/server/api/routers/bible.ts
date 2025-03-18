import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import axios from "axios";

// Base URL for the ABibliaDigital API
const API_BASE_URL = "https://www.abibliadigital.com.br/api";

// Common types for the API
export const BookAbbrevSchema = z.object({
  pt: z.string(),
  en: z.string(),
});

export const BookSchema = z.object({
  abbrev: BookAbbrevSchema,
  author: z.string(),
  chapters: z.number(),
  group: z.string(),
  name: z.string(),
  testament: z.string(),
});

export const BookDetailsSchema = BookSchema.extend({
  comment: z.string().optional(),
});

export const VerseSchema = z.object({
  number: z.number(),
  text: z.string(),
});

export const ChapterSchema = z.object({
  book: BookSchema.extend({
    version: z.string(),
  }),
  chapter: z.object({
    number: z.number(),
    verses: z.number(),
  }),
  verses: z.array(VerseSchema),
});

export const SingleVerseSchema = z.object({
  book: BookSchema.extend({
    version: z.string(),
  }),
  chapter: z.number(),
  number: z.number(),
  text: z.string(),
});

export const VersionSchema = z.object({
  version: z.string(),
  verses: z.number(),
});

export const SearchResultSchema = z.object({
  occurrence: z.number(),
  version: z.string(),
  verses: z.array(SingleVerseSchema),
});

// Type definitions for API responses
type BooksResponse = z.infer<typeof BookSchema>[];
type BookResponse = z.infer<typeof BookDetailsSchema>;
type ChapterResponse = z.infer<typeof ChapterSchema>;
type VerseResponse = z.infer<typeof SingleVerseSchema>;
type VersionsResponse = z.infer<typeof VersionSchema>[];
type SearchResponse = z.infer<typeof SearchResultSchema>;

type UserResponse = {
  name: string;
  email: string;
  token: string;
  notifications: boolean;
  lastLogin?: string;
};

type UserStatsResponse = {
  lastLogin: string;
  requestsPerMonth: {
    range: string;
    total: number;
  }[];
};

type MessageResponse = {
  msg: string;
};

type RequestsResponse = {
  url: string;
  date: string;
}[];

type RequestsAmountResponse = {
  total: number;
  requests: {
    _id: string;
    count: number;
  }[];
};

export const bibleRouter = createTRPCRouter({
  // Books endpoints
  getBooks: publicProcedure.query(async () => {
    const { data } = await axios.get<BooksResponse>(`${API_BASE_URL}/books`);
    return z.array(BookSchema).parse(data);
  }),

  getBook: publicProcedure
    .input(z.object({ abbrev: z.string() }))
    .query(async ({ input }) => {
      const { data } = await axios.get<BookResponse>(`${API_BASE_URL}/books/${input.abbrev}`);
      return BookDetailsSchema.parse(data);
    }),

  // Verses endpoints
  getChapter: publicProcedure
    .input(
      z.object({
        version: z.string(),
        abbrev: z.string(),
        chapter: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { data } = await axios.get<ChapterResponse>(
        `${API_BASE_URL}/verses/${input.version}/${input.abbrev}/${input.chapter}`,
      );
      return ChapterSchema.parse(data);
    }),

  getVerse: publicProcedure
    .input(
      z.object({
        version: z.string(),
        abbrev: z.string(),
        chapter: z.number(),
        number: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { data } = await axios.get<VerseResponse>(
        `${API_BASE_URL}/verses/${input.version}/${input.abbrev}/${input.chapter}/${input.number}`,
      );
      return SingleVerseSchema.parse(data);
    }),

  getRandomVerse: publicProcedure
    .input(z.object({ version: z.string() }))
    .query(async ({ input }) => {
      const { data } = await axios.get<VerseResponse>(
        `${API_BASE_URL}/verses/${input.version}/random`,
      );
      return SingleVerseSchema.parse(data);
    }),

  getRandomVerseFromBook: publicProcedure
    .input(
      z.object({
        version: z.string(),
        abbrev: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { data } = await axios.get<VerseResponse>(
        `${API_BASE_URL}/verses/${input.version}/${input.abbrev}/random`,
      );
      return SingleVerseSchema.parse(data);
    }),

  searchVerses: publicProcedure
    .input(
      z.object({
        version: z.string(),
        search: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = await axios.post<SearchResponse>(`${API_BASE_URL}/verses/search`, {
        version: input.version,
        search: input.search,
      });
      return SearchResultSchema.parse(data);
    }),

  // Versions endpoint
  getVersions: publicProcedure.query(async () => {
    const { data } = await axios.get<VersionsResponse>(`${API_BASE_URL}/versions`);
    return z.array(VersionSchema).parse(data);
  }),

  // User endpoints
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        notifications: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = await axios.post<UserResponse>(`${API_BASE_URL}/users`, input);
      return z
        .object({
          name: z.string(),
          email: z.string().email(),
          token: z.string(),
          notifications: z.boolean(),
        })
        .parse(data);
    }),

  getUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        token: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { data } = await axios.get<UserResponse>(`${API_BASE_URL}/users/${input.email}`, {
        headers: {
          Authorization: `Bearer ${input.token}`,
        },
      });
      return z
        .object({
          name: z.string(),
          email: z.string().email(),
          token: z.string(),
          notifications: z.boolean(),
          lastLogin: z.string(),
        })
        .parse(data);
    }),

  getUserStats: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { data } = await axios.get<UserStatsResponse>(`${API_BASE_URL}/users/stats`, {
        headers: {
          Authorization: `Bearer ${input.token}`,
        },
      });
      return z
        .object({
          lastLogin: z.string(),
          requestsPerMonth: z.array(
            z.object({
              range: z.string(),
              total: z.number(),
            }),
          ),
        })
        .parse(data);
    }),

  updateToken: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = await axios.put<UserResponse>(`${API_BASE_URL}/users/token`, input);
      return z
        .object({
          name: z.string(),
          email: z.string().email(),
          token: z.string(),
        })
        .parse(data);
    }),

  deleteUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        token: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { token, ...credentials } = input;
      const { data } = await axios.delete<MessageResponse>(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: credentials,
      });
      return z
        .object({
          msg: z.string(),
        })
        .parse(data);
    }),

  resendPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { data } = await axios.post<MessageResponse>(
        `${API_BASE_URL}/users/password/${input.email}`,
      );
      return z
        .object({
          msg: z.string(),
        })
        .parse(data);
    }),

  // Requests endpoints
  getRequests: publicProcedure
    .input(
      z.object({
        range: z.enum(["month", "week", "day"]),
        token: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { data } = await axios.get<RequestsResponse>(`${API_BASE_URL}/requests/${input.range}`, {
        headers: {
          Authorization: `Bearer ${input.token}`,
        },
      });
      return z
        .array(
          z.object({
            url: z.string(),
            date: z.string(),
          }),
        )
        .parse(data);
    }),

  getRequestsAmount: publicProcedure
    .input(
      z.object({
        range: z.enum(["month", "week", "day"]),
        token: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { data } = await axios.get<RequestsAmountResponse>(
        `${API_BASE_URL}/requests/amount/${input.range}`,
        {
          headers: {
            Authorization: `Bearer ${input.token}`,
          },
        },
      );
      return z
        .object({
          total: z.number(),
          requests: z.array(
            z.object({
              _id: z.string(),
              count: z.number(),
            }),
          ),
        })
        .parse(data);
    }),
});
