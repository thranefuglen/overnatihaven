import { InquiryService } from './inquiryService';
import { inquiryRepository } from '../repositories/inquiryRepository';

// Mock dependencies
jest.mock('../repositories/inquiryRepository');
jest.mock('./emailService');
jest.mock('../config/logger');

describe('InquiryService', () => {
  let inquiryService: InquiryService;

  beforeEach(() => {
    inquiryService = new InquiryService();
    jest.clearAllMocks();
  });

  describe('createInquiry', () => {
    it('should create inquiry when dates are available', async () => {
      const mockInquiry = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        phone: null,
        arrival_date: '2025-06-01',
        departure_date: '2025-06-03',
        num_people: 2,
        message: null,
        status: 'pending' as const,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const inputData = {
        name: 'Test User',
        email: 'test@example.com',
        arrivalDate: '2025-06-01',
        departureDate: '2025-06-03',
        numPeople: 2,
      };

      (inquiryRepository.hasOverlap as jest.Mock).mockReturnValue(false);
      (inquiryRepository.create as jest.Mock).mockReturnValue(mockInquiry);

      const result = await inquiryService.createInquiry(inputData);

      expect(result).toEqual(mockInquiry);
      expect(inquiryRepository.hasOverlap).toHaveBeenCalledWith(
        inputData.arrivalDate,
        inputData.departureDate
      );
      expect(inquiryRepository.create).toHaveBeenCalledWith(inputData);
    });

    it('should throw error when dates overlap with existing booking', async () => {
      const inputData = {
        name: 'Test User',
        email: 'test@example.com',
        arrivalDate: '2025-06-01',
        departureDate: '2025-06-03',
        numPeople: 2,
      };

      (inquiryRepository.hasOverlap as jest.Mock).mockReturnValue(true);

      await expect(inquiryService.createInquiry(inputData)).rejects.toThrow(
        'Der er allerede en booking i denne periode'
      );
    });
  });

  describe('checkAvailability', () => {
    it('should return true when dates are available', () => {
      (inquiryRepository.hasOverlap as jest.Mock).mockReturnValue(false);

      const result = inquiryService.checkAvailability('2025-06-01', '2025-06-03');

      expect(result).toBe(true);
    });

    it('should return false when dates are not available', () => {
      (inquiryRepository.hasOverlap as jest.Mock).mockReturnValue(true);

      const result = inquiryService.checkAvailability('2025-06-01', '2025-06-03');

      expect(result).toBe(false);
    });
  });
});
