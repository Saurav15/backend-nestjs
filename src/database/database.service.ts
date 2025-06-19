/**
 * Service to verify and log database connection status on module initialization.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private datasource: DataSource) {}

  /**
   * Checks and logs the database connection status when the module is initialized.
   */
  onModuleInit() {
    if (this.datasource.isInitialized) {
      console.log('Successfully connected to the database');
    } else {
      console.error('Failed to connect to the database');
      throw new Error('Database connection not initialized');
    }
  }
}
