import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface SubscriberAttributes {
  id: number;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubscriberCreationAttributes extends Optional<SubscriberAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Subscriber extends Model<SubscriberAttributes, SubscriberCreationAttributes> implements SubscriberAttributes {
  public id!: number;
  public email!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initializeSubscriberModel(sequelize: Sequelize) {
  Subscriber.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
    },
    {
      sequelize,
      modelName: 'Subscriber',
      tableName: 'subscribers',
      timestamps: true,
    }
  );
}

export default Subscriber;
