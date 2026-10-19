import type { FastifyPluginAsync } from 'fastify';
import type { DatabaseClient } from '../db.js';
import { getTeamOverview } from '../handlers/get-team-overview.js';
import { listTeamsHandler } from '../handlers/list-teams.js';
import { searchTeamsHandler } from '../handlers/search-teams.js';
import {
  parseOptionalPositiveInt,
  parseRequiredPositiveInt,
} from '../parse-query.js';

export function createTeamsRoutes(db: DatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.get<{
      Querystring: {
        gender?: string;
        category?: string;
        phase?: string;
      };
    }>('/teams', async (request) => {
      return listTeamsHandler(db, {
        gender: request.query.gender,
        category: request.query.category,
        phase: request.query.phase,
      });
    });

    app.get<{
      Querystring: { q?: string; limit?: string };
    }>('/teams/search', async (request) => {
      const limit = parseOptionalPositiveInt(request.query.limit);

      return searchTeamsHandler(db, {
        q: request.query.q,
        limit,
      });
    });

    app.get<{
      Params: { id: string };
      Querystring: { phase?: string };
    }>('/teams/:id/overview', async (request) => {
      const teamId = parseRequiredPositiveInt(request.params.id);

      return getTeamOverview(db, teamId, request.query.phase);
    });
  };
}
