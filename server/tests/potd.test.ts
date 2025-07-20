import request from 'supertest';
import { app } from '../src/index';

describe('POTD Endpoints', () => {
  const validQuery = `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        date
        userStatus
        link
        question {
          acRate
          difficulty
          freqBar
          frontendQuestionId: questionFrontendId
          isFavor
          paidOnly: isPaidOnly
          status
          title
          titleSlug
          hasVideoSolution
          hasSolution
          topicTags {
            name
            id
            slug
          }
        }
      }
    }
  `;

  describe('POST /potd', () => {
    it('should fetch daily problem successfully', async () => {
      const response = await request(app)
        .post('/api/potd')
        .send({ query: validQuery })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('activeDailyCodingChallengeQuestion');
      
      const problem = response.body.data.activeDailyCodingChallengeQuestion;
      expect(problem).toHaveProperty('date');
      expect(problem).toHaveProperty('link');
      expect(problem).toHaveProperty('question');
      expect(problem.question).toHaveProperty('title');
      expect(problem.question).toHaveProperty('difficulty');
      expect(problem.question).toHaveProperty('frontendQuestionId');
    }, 10000); // 10 second timeout for external API call

    it('should fail without query', async () => {
      const response = await request(app)
        .post('/api/potd')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'GraphQL query is required');
    });

    it('should fail with invalid query', async () => {
      const response = await request(app)
        .post('/api/potd')
        .send({ query: 'invalid query' })
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /potd/codeforces', () => {
    it('should return not implemented', async () => {
      const response = await request(app)
        .get('/api/potd/codeforces')
        .expect(501);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'CodeForces daily problem not implemented yet');
    });
  });
});
