import bcrypt from 'bcrypt';
import UserInterface from "../repository/UserRepository/UserInterface";
import ServiceType from "../types/ServiceType";
import UserValidation from '../validation/UserValidation';
import ProfileInterface from '../repository/ProfileRepository/ProfileInterface';

class UserService {
    constructor(
        private userRepository: UserInterface,
        private profileRepository: ProfileInterface
    ) {}

    async getData(): Promise<ServiceType> {
        const users = await this.userRepository.getData()
       
    
        const returnData: ServiceType = {
            status: true,
            response: "get",
            data: users,
        };
      
          return returnData;
    }

    async createData(data: any): Promise<ServiceType> {

        let returnData
        const { error } = UserValidation.createUser.validate(data, {abortEarly: false})

        if (error) {
            const errors = error.details.map((err) => err.message);

            returnData = {
                status: false,
                response: "validation",
                errors: errors,
            };

            return returnData
        }

        if (data.gender !== 'male' && data.gender !== 'female') {
            returnData = {
                status: false,
                response: "validation",
                errors: "Invalid gender: It must be either male or female.",
            };

            return returnData
        }

        const findUserByEmail = await this.userRepository.checkEmailData(data.email)

        if (findUserByEmail) {
            if (findUserByEmail.deletedAt === null) {
                returnData = {
                    status: false,
                    response: "validation",
                    message: "Email is already in use",
                };
            }
            else {
                returnData = {
                    status: false,
                    response: "server",
                    message: "The email you provided has already been deleted and cannot be used for new data creation",
                }
            }

            return returnData
        }

        const password: string = bcrypt.hashSync(data.password, 10)
        const birthdayDate = new Date(data.birthday_date)

        const dataUser: object = {
            email: data.email,
            password,
            profiles: {
                create: {
                    firstName: data.first_name,
                    lastName: data.last_name,
                    gender: data.gender
                }
            }
        }

        const user = await this.userRepository.createData(dataUser)

        returnData = {
            status: true,
            response: "created",
            data: user,
        };
      
        return returnData;
    }

    async detailData(id: number): Promise<ServiceType> {
        const users = await this.userRepository.detailData(id)

        let returnData
        if (users) {
            returnData = {
                status: true,
                response: "get",
                data: users,
            };
        }
        else {
            returnData = {
                status: false,
                response: "validation",
                message: "ID User Not Found",
            };
        }
      
        return returnData;
    }

    async updateData(id: number, data: any): Promise<ServiceType> {

        const { error } = UserValidation.updateUser.validate(data, {abortEarly: false})

        let returnData
        if (error) {
            const errors = error.details.map((err) => err.message);

            returnData = {
                status: false,
                response: "validation",
                errors: errors,
            };

            return returnData
        }

        if (data.gender !== 'male' && data.gender !== 'female') {
            returnData = {
                status: false,
                response: "validation",
                errors: "Invalid gender: It must be either male or female.",
            };

            return returnData
        }
        
        const checkUser = await this.userRepository.detailData(id)
        
        if (!checkUser) {
            returnData = {
                status: false,
                response: "validation",
                message: "ID User Not Found",
                errors: null
            };
            return returnData
        }

        if (data.email) {
            const findUserByEmail = await this.userRepository.checkEmailData(data.email)

            if (findUserByEmail && findUserByEmail.id !== id) {
            
                if (findUserByEmail.deletedAt === null) {
                    returnData = {
                        status: false,
                        response: "validation",
                        message: "Email is already in use",
                    };
                }
                else {
                    returnData = {
                        status: false,
                        response: "server",
                        message: "The email you provided has already been deleted and cannot be used for new data creation",
                    }
                }
    
                return returnData
            }
        }

        let password
        
        if (data.password) {
            password = bcrypt.hashSync(data.password, 10)
        }

        const dataUser: object = {
            email: data.email ?? undefined,
            password: password ?? undefined,
            profiles: {
                update: {
                    firstName: data.first_name ?? undefined,
                    lastName: data.last_name ?? undefined,
                    gender: data.gender ?? undefined,
                }
            }
        }

        const user = await this.userRepository.updateData(id, dataUser)

        returnData = {
            status: true,
            response: "updated",
            data: user,
        };
      
        return returnData;
    }

    async deleteData(id: number): Promise<ServiceType> {
        const checkUser = await this.userRepository.detailData(id)
        
        let returnData
        if (!checkUser) {
            returnData = {
                status: false,
                response: "validation",
                message: "ID User Not Found",
                errors: null
            };
            return returnData
        }

        const users = await this.userRepository.deleteData(id)

        if (users) {
            returnData = {
                status: true,
                response: "deleted",
                data: users,
            };
        }
        else {
            returnData = {
                status: false,
                response: "validation",
                message: "ID User Not Found",
            };
        }
      
        return returnData;
    }
}

export default UserService
