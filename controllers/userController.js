import { UserModel } from '../models/userModel.js';
import { AddressSchema } from '../models/addressModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

// generate access token and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await UserModel.findById(userId)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // store refresh token in database 
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {accessToken, refreshToken}

  } catch (error) {
    return res.status(500).send({message: 'Error generate Access And Refresh Token', error});
  }
};

const registerController = async (req, res) => {
  try {
    const {userName, fullName, email, password, answer} = req.body;
  
    if([userName, fullName, email, password, answer].some((fields) => fields?.trim() === "")){
      return res.status(400).json({success: false, message: "All fields are required"})
    }

    // Check if the user is already registered
    const existedUser = await UserModel.findOne({ $or: [{userName}, {email}] })

    if(existedUser){
      return res.status(409).json({success: false, message: "Already registered"})
    };

    const user = await UserModel.create({
        userName: userName.toLowerCase(),
        fullName: fullName.toLowerCase(),
        email,
        password,
        answer
    });

    const createdUser = await UserModel.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
      return res.status(500).json({success: false, message: "Something went wrong while registering the user"})
    }

    return res.status(200).json({
      createdUser, 
      success: true, 
      message: "Registration successful"
    })

  } catch (error) {
    res.status(500).json({
      success: false, 
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

const loginController = async (req, res) => {
  try {
    // data from req.body
    const {userName, password} = req.body;

    // check all fields are filled
    if(!userName && !password){
      return res.status(404).json({success: false, message: "All fields are required"})
    }

    // find user by username
    const user = await UserModel.findOne({userName})
    if(!user){
      return res.status(404).json({success: false, message: "Can't find user"})
    }

    // check password is correct
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
      return res.status(401).json({success: false, message: "Invalid user credentials"})
    }

    // accessToken and refreshToken generate by 'generateAccessAndRefreshToken(give_userId)'
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedinUser = await UserModel.findById(user._id).select('-password -refreshToken').populate('address')

    const options = {
      httpOnly: true,
      secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({user: loggedinUser, success: true, message: "Login successful"})

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error while user login',
      error: error.message
    });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const {email, answer, newPassword} = req.body;
    if(!email && !answer && !newPassword) {
      return res.status(400).json({success: false, message: "All fields are required"})
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await UserModel.findOneAndUpdate(
      { email, answer },
      { password: hashedPassword },
      { new: true, runValidators: true }
    );

    if(!user){
      return res.status(404).json({success: false, message: "Invalid Cradentials"})
    }

    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error while resetting password',
      error: error.message
    });
  }
};

const logout = async (req, res) => {
  try {
    await UserModel.findByIdAndUpdate(
      req.user._id, 
      {$set: {refreshToken: undefined}}, 
      {new: true}
    )

    const options = {
      httpOnly: true,
      secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
      success: true,
      message: "Logout successful"
    })

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong while logging out"
    })
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const inComingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!inComingRefreshToken){
      return res.status(404).send({success: false, message: "Unauthorized access"})
    }

    const decodedToken = jwt.verify(inComingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await UserModel.findById(decodedToken?._id)
    if(!user){
      return res.status(404).send({success: false, message: "Invalid refresh token"})
    }

    if(inComingRefreshToken !== user?.refreshToken){
      return res.status(401).send({success: false, message: "Refresh token expired or used"})
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json({
      accessToken, refreshToken: newRefreshToken,
      success: true,
      message: "Access token refreshed successfully"
    })

  } catch (error) {
    res
    .status(500)
    .send({success: false, message: "Something went wrong in while refreshing access token"})
  }
};

const deleteUser = async (req, res) => {
  try {
    await UserModel.findByIdAndDelete(req.params.id)
    return res
    .status(200)
    .send({ 
      success: true,
      message: "User deleted successfully"
    })

  } catch (error) {
    res
    .status(500)
    .send({
      success: false,
      message: "Something went wrong in DeleteUser"
    })
  }
};

const getAllUser = async (req, res) => {
  try {
    const allUsers = await UserModel.find({}).populate('address');

    res.status(200).send({success: true, message: `${allUsers.length} users found`, users: allUsers})

  } catch (error) {
    res
    .status(500)
    .send({
      success: false,
      message: "Something went wrong in Getting All Users"
    })
  }
};

// const getOneUser = async (req, res) => {
//   try {
//     const {userId} = req.params;
    
//   } catch (error) {
//     res
//     .status(500)
//     .send({
//       success: false, 
//       message: "Something went wrong in Getting Users"
//     })
//   }
// };

// const updateUserAddress = async (req, res) => {
//     try {
//         const { userId } = req.params; // Get userId from request parameters
//         const { street, phone, city, state, postalCode, country } = req.body;

//         // Validate address fields
//         if ([street, phone, city, state, postalCode, country].some((field) => field.trim() === "")) {
//             return res.status(400).json({ success: false, message: "All address fields are required" });
//         }

//         // Create or update address
//         let address ;
//         if (addressId) {
//             // Update existing address
//             address = await AddressSchema.findByIdAndUpdate(
//                 address._id,
//                 { street, phone, city, state, postalCode, country },
//                 { new: true } // Return the updated document
//             );
//         } else {
//             // Create new address
//             address = await AddressSchema.create({
//                 street, phone, city, state, postalCode, country, userOwn: userId
//             });
//         }

//         // Update user with address reference
//         await UserModel.findByIdAndUpdate(userId, { $set: { address: address._id } });

//         // Fetch the updated user with address details
//         const updatedUser = await UserModel.findById(userId).populate('address').select("-password -refreshToken");

//         res.status(200).json({
//             success: true,
//             message: "Address updated successfully",
//             user: updatedUser
//         });

//     } catch (error) {
//         console.error('Error updating address:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error updating address',
//             error: error.message
//         });
//     }
// };


export {registerController, loginController, forgotPasswordController, logout, refreshAccessToken, deleteUser, getAllUser}