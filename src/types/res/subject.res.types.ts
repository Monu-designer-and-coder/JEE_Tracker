import { Types } from "mongoose";

export interface iSubjectResponse {
  _id: Types.ObjectId | string;
  name: string;
}