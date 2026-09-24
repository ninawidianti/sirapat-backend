'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Minute extends Model {
        static associate(models) {
            Minute.belongsTo(models.Meeting, {
                foreignKey: 'meeting_id',
                as: 'meeting'
            });
            Minute.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
        }
    }

    Minute.init(
        {
            minutes_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            meeting_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            discussion: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            decisions: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            // models/Minute.js
            invitation_img: {
                type: DataTypes.TEXT,
                allowNull: true,
                get() {
                    const rawValue = this.getDataValue('invitation_img');
                    return rawValue ? JSON.parse(rawValue) : [];
                },
                set(value) {
                    this.setDataValue('invitation_img', JSON.stringify(value));
                }
            },
            documentation_img: {
                type: DataTypes.TEXT,
                allowNull: true,
                get() {
                    const rawValue = this.getDataValue('documentation_img');
                    return rawValue ? JSON.parse(rawValue) : [];
                },
                set(value) {
                    this.setDataValue('documentation_img', JSON.stringify(value));
                }
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Minute',
            tableName: 'minutes',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    return Minute;
};