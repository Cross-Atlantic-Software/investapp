import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface MethodologyNoteAttributes {
  id: number;
  section_key: string;
  section_name: string;
  methodology_text: string;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at?: Date;
  updated_at?: Date;
}

interface MethodologyNoteCreationAttributes extends Optional<MethodologyNoteAttributes, 'id' | 'created_at' | 'updated_at'> {}

class MethodologyNote extends Model<MethodologyNoteAttributes, MethodologyNoteCreationAttributes> implements MethodologyNoteAttributes {
  public id!: number;
  public section_key!: string;
  public section_name!: string;
  public methodology_text!: string;
  public is_active!: boolean;
  public created_by!: number;
  public updated_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}


export { MethodologyNote, MethodologyNoteAttributes, MethodologyNoteCreationAttributes };

export function initializeMethodologyNoteModel(sequelize: Sequelize) {
  MethodologyNote.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      section_key: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      section_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      methodology_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'methodology_notes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
}
