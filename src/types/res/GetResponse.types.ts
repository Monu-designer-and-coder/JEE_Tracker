export interface GetSubjectResponse {
	_id: string;
	name: string;
}

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Renamed getSubjectResponse to GetSubjectResponse to adhere to standard TypeScript PascalCase naming conventions for interfaces.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Lean interface ensures tight type-checking across API boundaries.

// ! FUTURE IMPROVEMENTS:
// TODO: Add createdAt and updatedAt if frontend requires sorting or displaying timestamps.