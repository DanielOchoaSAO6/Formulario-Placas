import { userResolvers } from './user.resolvers';
import { postResolvers } from './post.resolvers';
import { vehicleResolvers } from './vehicle.resolvers';
import { verificationResolvers } from './verification.resolvers';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...vehicleResolvers.Query,
    ...verificationResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...verificationResolvers.Mutation,
    ...vehicleResolvers.Mutation,
  },
  User: {
    ...userResolvers.User,
  },
  Post: {
    ...postResolvers.Post,
  },
  Vehicle: {
    conductor: (parent: any) => {
      if (parent.conductor) return parent.conductor;
      return null;
    }
  },
  VehicleVerificationLog: {
    ...verificationResolvers.VehicleVerificationLog,
  },
};
