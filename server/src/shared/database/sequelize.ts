import { Sequelize } from 'sequelize';
import { config } from '../../app/config/config';

export const sequelize = new Sequelize(
  config.MYSQL_DATABASE,
  config.MYSQL_USER,
  config.MYSQL_PASSWORD,
  {
    host: config.MYSQL_HOST,
    port: config.MYSQL_PORT,
    dialect: 'mysql',
    logging: config.NODE_ENV === 'development' ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
    },
  },
);
