// api.js - Centralized API configuration and data fetching

// Centralized API configuration
const API_CONFIG = {
    BASE_URL: "http://127.0.0.1:8000",
    ENDPOINTS: {
        COMBINED_DATA: "/combined-data",
        MOCK_BONE_DATA: "./js/mock-bone-data.json"
    }
};

export async function fetchCombinedData() {
    try {
        const bonesetIDs = ["bony_pelvis"];
        const bonesetDataArray = [];

        const bonesets = [];
        const bones = [];
        const subbones = [];

        for (const bonesetId of bonesetIDs) {
            const bonesetData = await fetch(`./data/boneset/${bonesetId}.json`).then(response => {
                if (!response.ok) {

                }
                return response.json();
            });
            bonesetDataArray.push(bonesetData);
            bonesets.push({id: bonesetData.id, name: bonesetData.name});
        }

        for (const bonesetData of bonesetDataArray) {
            for (const boneId of bonesetData.bones) {
                const boneData = await fetch(`./data/bones/${boneId}.json`).then(response => {
                    if (!response.ok) {
                        // throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                });
                if (boneData) {
                    bones.push({id: boneData.id, name: boneData.name, boneset: bonesetData.id});
                    (boneData.subBones || []).forEach((subBoneId) => {
                        subbones.push({ id: subBoneId, name: subBoneId.replace(/_/g, " "), bone: boneData.id });
                    });
                }
            }
        }

        return {bonesets, bones, subbones};
    } catch (error) {
        console.error("Error fetching combined data:", error);
        throw error;
    }
}

export async function fetchMockBoneData() {
    try {
        const response = await fetch(API_CONFIG.ENDPOINTS.MOCK_BONE_DATA);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching mock bone data:", error);
        return null;
    }
}

/**
 * Fetch full bone data (description + images) for a single bone from the backend API.
 * The backend pulls these files from the DataPelvis GitHub branch.
 * @param {string} boneId
 * @returns {Object|null} bone data or null on error
 */
export async function fetchBoneData(boneId) {
    if (!boneId) return null;

    try {
        const descriptionFilename = `./data/descriptions/${boneId}_description.json`;
        const descriptionData = await fetch(descriptionFilename).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });

        const imagesArray = descriptionData.images || [];
        const images = imagesArray.map(filename => ({
            filename: filename,
            url: `./data/images/${filename}`
        }));

        return {
            name: descriptionData.name,
            id: descriptionData.id,
            description: descriptionData.description,
            images: images
        };
    } catch (err) {
        console.error(`Error fetching bone data for ${boneId}:`, err);
        return null;
    }
}

// Export configuration for other modules to use
export { API_CONFIG };
