import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
    OneToMany
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
    validateOrReject,
} from 'class-validator';


@Entity(
    {
        name: 'coop_type',
        synchronize: false
    }
)
// @CdModel
export class CoopTypeModel {

    @PrimaryGeneratedColumn(
        {
            name: 'coop_type_id'
        }
    )
    coopTypeId?: number;

    @Column({
        name: 'coop_type_guid',
        length: 36,
        default: uuidv4()
    })
    coopTypeGuid?: string;

    @Column(
        'varchar',
        {
            name: 'coop_type_name',
            length: 50,
            nullable: true
        }
    )
    coopTypeName: string;

    @Column(
        'varchar',
        {
            name: 'coop_type_description',
            length: 50,
            nullable: true
        }
    )
    coopTypeDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        })
    docId: number;

    @Column(
        {
            name: 'parent_guid',
            default: null
        })
    parentGuid: string;

    @Column(
        {
            name: 'coop_type_enabled',
            default: null
        })
    coopTypeEnabled: boolean;



    // HOOKS
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

}
