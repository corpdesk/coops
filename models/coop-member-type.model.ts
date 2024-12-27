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
        name: 'coop_member_type',
        synchronize: false
    }
)
// @CdModel
export class CoopMemberTypeModel {

    @PrimaryGeneratedColumn(
        {
            name: 'coop_member_type_id'
        }
    )
    coopMemberTypeId?: number;

    @Column({
        name: 'coop_member_type_guid',
        length: 36,
        default: uuidv4()
    })
    coopTypeGuid?: string;

    @Column(
        'varchar',
        {
            name: 'coop_member_type_name',
            length: 50,
            nullable: true
        }
    )
    coopMemberTypeName: string;

    @Column(
        'varchar',
        {
            name: 'coop_member_type_description',
            length: 50,
            nullable: true
        }
    )
    coopMemberTypeDescription: string;

    @Column(
        {
            name: 'doc_id',
            default: null
        })
    docId: number;

    // // HOOKS
    // @BeforeInsert()
    // @BeforeUpdate()
    // async validate() {
    //     await validateOrReject(this);
    // }

}
