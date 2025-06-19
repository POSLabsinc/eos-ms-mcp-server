import { EOSApiService } from '../services/eosApiService';
import { LoginRequest } from '../types';

describe('EOSApiService', () => {
  let eosApi: EOSApiService;

  beforeEach(() => {
    eosApi = new EOSApiService('https://browserapi.eatos.net');
  });

  describe('login', () => {
    it('should handle successful login', async () => {
      const credentials: LoginRequest = {
        username: 'mp5@eigital.com',
        password: 'Test@055'
      };

      // Mock the API call for testing
      jest.spyOn(eosApi as any, 'api').mockImplementation({
        post: jest.fn().mockResolvedValue({
          data: {
            success: true,
            data: {
              token: 'mock-token',
              user: {
                id: '1',
                username: 'mp5@eigital.com',
                email: 'mp5@eigital.com',
                role: 'admin'
              }
            }
          }
        })
      });

      const result = await eosApi.login(credentials);
      
      expect(result.success).toBe(true);
      expect(result.data?.user.username).toBe('mp5@eigital.com');
    });

    it('should handle login failure', async () => {
      const credentials: LoginRequest = {
        username: 'invalid@email.com',
        password: 'wrongpassword'
      };

      // Mock API failure
      jest.spyOn(eosApi as any, 'api').mockImplementation({
        post: jest.fn().mockRejectedValue({
          response: {
            status: 401,
            data: {
              success: false,
              message: 'Invalid credentials'
            }
          }
        })
      });

      await expect(eosApi.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is healthy', async () => {
      jest.spyOn(eosApi as any, 'api').mockImplementation({
        get: jest.fn().mockResolvedValue({ data: { status: 'ok' } })
      });

      const result = await eosApi.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when API is unhealthy', async () => {
      jest.spyOn(eosApi as any, 'api').mockImplementation({
        get: jest.fn().mockRejectedValue(new Error('Network error'))
      });

      const result = await eosApi.healthCheck();
      expect(result).toBe(false);
    });
  });
}); 