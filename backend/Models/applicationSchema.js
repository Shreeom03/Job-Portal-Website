import mongoose from "mongoose";
import validator from "validator";

const applicationsSchema = new mongoose.Schema({
    jobSeekerInfo:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        email:{
            type: String,
            required: true,
            validate: [validator.isEmail, "Please provide an valid Email Id"]
        },
        phone: {
            type: Number,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        resume: {
            public_id: String,
            url: String,
        },
        coverLetter:{
            type:String,
            required: true,
        },
        role:{
            type:String,
            enum: ["Job Seeker"],
            required: true,
        }
    },
    employerInfo:{
        id:{
           type: mongoose.Schema.Types.ObjectId,
           ref: "User",
           required: true, 
        },
        role:{
            type: String,
            enum: ["Employer"],
            required:true,
        }
    },
    jobInfo:{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, 
        },
        jobTitle: {
            type: String,
            required: true,
        }
    },
    deletedBy: {
        jobSeeker: {
            type: Boolean,
            default: false
        },
        employer:{
            type: Boolean,
            default: false
        }
    }
});

export const Application = mongoose.model("Application", applicationsSchema);