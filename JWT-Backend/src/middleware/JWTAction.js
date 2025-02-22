require('dotenv').config();
import jwt from 'jsonwebtoken';

const nonSecurePaths = ['/logout', '/login', '/register'];

const createJWT = (payload) => {
	let key = process.env.JWT_SECRET;
	let token = null;
	try {
		token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPIRES_IN });
	} catch (err) {
		console.log(err);
	}
	return token;
};

const verifyToken = (token) => {
	let key = process.env.JWT_SECRET;
	let decoded = null;
	try {
		decoded = jwt.verify(token, key);
	} catch (err) {
		console.log(err);
	}
	return decoded;
};

const extractToken = (req) => {
	if (
		req.headers.authorization &&
		req.headers.authorization.split(' ')[0] === 'Bearer'
	) {
		return req.headers.authorization.split(' ')[1];
	}
	return null;
};

const checkUserJWT = (req, res, next) => {
	if (nonSecurePaths.includes(req.path)) return next();

	let cookies = req.cookies; //Tu dong lay tat ca cookies ma user gui len
	let tokenFromHeader = extractToken(req);

	if ((cookies && cookies.jwt) || tokenFromHeader) {
		let token = cookies && cookies.jwt ? cookies.jwt : tokenFromHeader;
		let decoded = verifyToken(token);
		if (decoded) {
			req.user = decoded;
			req.token = token;
			next();
		} else {
			return res.status(401).json({
				EC: -1,
				DT: '',
				EM: 'Not authentication the user'
			});
		}
	} else {
		return res.status(401).json({
			//401: User chua dang nhap
			EC: -1,
			DT: '',
			EM: 'Not authentication the user'
		});
	}
};

const checkUserPermission = (req, res, next) => {
	if (nonSecurePaths.includes(req.path) || req.path === '/account')
		return next();

	if (req.user) {
		let email = req.user.email;
		let roles = req.user.groupWithRoles.Roles;
		let currentUrl = req.path;

		if (!roles || roles.length === 0) {
			return res.status(403).json({
				// Ko co quyen truy cap
				EC: -1,
				DT: '',
				EM: 'U dont have permission to access this resource...'
			});
		}
		//some tra ve T or F
		let canAccess = roles.some(
			(item) => item.url === currentUrl || currentUrl.includes(item.url)
		);
		if (canAccess === true) {
			next();
		} else {
			return res.status(403).json({
				// Ko co quyen truy cap
				EC: -1,
				DT: '',
				EM: 'U dont have permission to access this resource...'
			});
		}
	} else {
		return res.status(401).json({
			//401: User chua dang nhap
			EC: -1,
			DT: '',
			EM: 'Not authenticated the user'
		});
	}
};

module.exports = { createJWT, verifyToken, checkUserJWT, checkUserPermission };
