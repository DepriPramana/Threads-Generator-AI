// --- Global State ---
let currentGeneratedThread = null; // To hold the latest generated thread data

// --- Gemini API Call ---
async function callGemini(prompt, apiKey) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: { thread: { type: "ARRAY", items: { type: "STRING" } } },
            }
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const textContent = data.candidates[0].content.parts[0].text;
        return JSON.parse(textContent);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

// --- DOM and Event Handling ---
document.addEventListener('DOMContentLoaded', () => {
    // Get all necessary DOM elements
    const promptEl = document.getElementById('prompt');
    const styleEl = document.getElementById('writing-style');
    const maxCharsEl = document.getElementById('max-chars');
    const apiKeyEl = document.getElementById('api-key');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const keyStatusEl = document.getElementById('key-status');
    const generateBtn = document.getElementById('generate-btn');
    const outputEl = document.getElementById('output');
    const errorOutputEl = document.getElementById('error-output');
    const loader = document.getElementById('loader');
    const generateBtnText = document.getElementById('generate-btn-text');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const htmlEl = document.documentElement;

    // Folder management elements
    const folderSelect = document.getElementById('folder-select');
    const newFolderNameEl = document.getElementById('new-folder-name');
    const addFolderBtn = document.getElementById('add-folder-btn');
    const deleteFolderBtn = document.getElementById('delete-folder-btn');
    const folderStatusEl = document.getElementById('folder-status');
    const savedThreadsContainer = document.getElementById('saved-threads-container');

    // --- UI Helper Functions ---
    const setLoading = (isLoading) => {
        generateBtn.disabled = isLoading;
        loader.classList.toggle('hidden', !isLoading);
        generateBtnText.classList.toggle('hidden', isLoading);
    };
    
    const showFolderStatus = (message, isError = false) => {
        folderStatusEl.textContent = message;
        folderStatusEl.className = `text-xs mt-1 ${isError ? 'text-red-500' : 'text-green-500'}`;
        setTimeout(() => { folderStatusEl.textContent = ''; }, 3000);
    };

    const populateFolderDropdown = (folders) => {
        const currentVal = folderSelect.value;
        folderSelect.innerHTML = '<option value="">-- Lihat riwayat --</option>';
        folders.sort().forEach(folder => {
            const option = document.createElement('option');
            option.value = folder;
            option.textContent = folder;
            folderSelect.appendChild(option);
        });
        folderSelect.value = currentVal;
    };

    const renderOutput = (data) => {
        outputEl.innerHTML = '';
        savedThreadsContainer.innerHTML = '';
        data.thread.forEach((part, index) => {
            const partContainer = document.createElement('div');
            partContainer.className = 'p-3 rounded-md bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 shadow-sm';
            const partText = document.createElement('p');
            partText.className = 'text-gray-800 dark:text-gray-200';
            partText.textContent = `${index + 1}. ${part}`;
            partContainer.appendChild(partText);
            outputEl.appendChild(partContainer);
        });

        const saveButton = document.createElement('button');
        saveButton.id = 'save-to-folder-btn';
        saveButton.textContent = 'Simpan ke Folder';
        saveButton.className = 'w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700';
        saveButton.onclick = () => {
            const selectedFolder = folderSelect.value;
            if (!selectedFolder) {
                showFolderStatus('Pilih folder tujuan untuk menyimpan.', true);
                return;
            }
            if (!currentGeneratedThread) return;
            chrome.storage.local.get('savedThreads', (result) => {
                const threadsInFolder = result.savedThreads[selectedFolder] || [];
                threadsInFolder.push(currentGeneratedThread);
                result.savedThreads[selectedFolder] = threadsInFolder;
                
                chrome.storage.local.set({ savedThreads: result.savedThreads }, () => {
                    saveButton.textContent = 'Berhasil Disimpan!';
                    saveButton.disabled = true;
                    saveButton.classList.remove('bg-green-600', 'hover:bg-green-700');
                    saveButton.classList.add('bg-gray-400');
                });
            });
        };
        outputEl.appendChild(saveButton);
    };

    const displaySavedThreads = (folderName) => {
        savedThreadsContainer.innerHTML = '';
        if (!folderName) return;

        chrome.storage.local.get('savedThreads', (result) => {
            const threads = result.savedThreads[folderName] || [];
            if (threads.length === 0) {
                savedThreadsContainer.innerHTML = `<p class="text-center text-sm text-gray-500 dark:text-gray-400">Folder ini kosong.</p>`;
                return;
            }

            threads.slice().reverse().forEach((threadData, revIndex) => {
                const originalIndex = threads.length - 1 - revIndex;
                
                const card = document.createElement('div');
                card.className = 'p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md';
                
                const header = document.createElement('div');
                header.className = 'flex justify-between items-start mb-2';
                
                const topicInfo = document.createElement('div');
                const topicEl = document.createElement('p');
                topicEl.className = 'font-bold text-gray-800 dark:text-gray-200';
                topicEl.textContent = threadData.topic;
                const dateEl = document.createElement('p');
                dateEl.className = 'text-xs text-gray-500 dark:text-gray-400';
                dateEl.textContent = new Date(threadData.timestamp).toLocaleString('id-ID');
                topicInfo.append(topicEl, dateEl);
                
                const deleteThreadBtn = document.createElement('button');
                deleteThreadBtn.textContent = 'Hapus';
                deleteThreadBtn.className = 'px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900';
                deleteThreadBtn.onclick = () => deleteSavedThread(folderName, originalIndex);
                
                header.append(topicInfo, deleteThreadBtn);

                const content = document.createElement('div');
                content.className = 'space-y-2';
                threadData.thread.forEach(part => {
                    const partEl = document.createElement('p');
                    partEl.className = 'text-sm bg-white dark:bg-gray-700 p-2 rounded-md';
                    partEl.textContent = part;
                    content.appendChild(partEl);
                });

                card.append(header, content);
                savedThreadsContainer.appendChild(card);
            });
        });
    };

    const deleteSavedThread = (folderName, threadIndex) => {
        chrome.storage.local.get('savedThreads', (result) => {
            result.savedThreads[folderName].splice(threadIndex, 1);
            chrome.storage.local.set({ savedThreads: result.savedThreads }, () => {
                displaySavedThreads(folderName);
            });
        });
    };

    // --- Initialization ---
    const initializeApp = () => {
        chrome.storage.local.get(['apiKey', 'darkMode', 'folders', 'savedThreads'], (result) => {
            if (result.apiKey) {
                apiKeyEl.value = result.apiKey;
                keyStatusEl.textContent = 'API Key tersimpan.';
                keyStatusEl.className = 'text-xs mt-1 text-green-500';
            }
            if (result.darkMode) {
                htmlEl.classList.add('dark');
                darkModeToggle.checked = true;
            }
            
            if (!result.folders || !result.savedThreads) {
                chrome.storage.local.set({ folders: [], savedThreads: {} }, () => populateFolderDropdown([]));
            } else {
                populateFolderDropdown(result.folders);
            }
        });
    };
    
    // --- Event Listeners ---
    folderSelect.addEventListener('change', () => {
        outputEl.innerHTML = ''; 
        errorOutputEl.textContent = '';
        displaySavedThreads(folderSelect.value);
    });

    addFolderBtn.addEventListener('click', () => {
        const newName = newFolderNameEl.value.trim();
        if (!newName) {
            showFolderStatus('Nama folder tidak boleh kosong.', true);
            return;
        }
        chrome.storage.local.get(['folders', 'savedThreads'], ({ folders, savedThreads }) => {
            if (folders.includes(newName)) {
                showFolderStatus('Folder dengan nama ini sudah ada.', true);
                return;
            }
            const updatedFolders = [...folders, newName];
            const updatedThreads = { ...savedThreads, [newName]: [] };
            chrome.storage.local.set({ folders: updatedFolders, savedThreads: updatedThreads }, () => {
                populateFolderDropdown(updatedFolders);
                newFolderNameEl.value = '';
                showFolderStatus(`Folder "${newName}" berhasil ditambahkan.`);
            });
        });
    });

    deleteFolderBtn.addEventListener('click', () => {
        const folderToDelete = folderSelect.value;
        if (!folderToDelete) {
            showFolderStatus('Pilih folder yang akan dihapus.', true);
            return;
        }
        chrome.storage.local.get(['folders', 'savedThreads'], ({ folders, savedThreads }) => {
            const updatedFolders = folders.filter(f => f !== folderToDelete);
            delete savedThreads[folderToDelete];
            chrome.storage.local.set({ folders: updatedFolders, savedThreads: savedThreads }, () => {
                populateFolderDropdown(updatedFolders);
                savedThreadsContainer.innerHTML = '';
                showFolderStatus(`Folder "${folderToDelete}" telah dihapus.`);
            });
        });
    });

    saveKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyEl.value.trim();
        if (apiKey) {
            chrome.storage.local.set({ apiKey: apiKey }, () => {
                keyStatusEl.textContent = 'API Key berhasil disimpan!';
                keyStatusEl.className = 'text-xs mt-1 text-green-500';
            });
        }
    });
    
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            htmlEl.classList.add('dark');
            chrome.storage.local.set({ darkMode: true });
        } else {
            htmlEl.classList.remove('dark');
            chrome.storage.local.set({ darkMode: false });
        }
    });
    
    generateBtn.addEventListener('click', async () => {
        outputEl.innerHTML = '';
        errorOutputEl.textContent = '';
        currentGeneratedThread = null;
        const topic = promptEl.value.trim();
        const apiKey = apiKeyEl.value.trim();
        if (!topic || !apiKey) {
            errorOutputEl.textContent = 'Topik Utama dan API Key tidak boleh kosong.';
            return;
        }
        setLoading(true);
        const fullPrompt = `Buatkan sebuah thread untuk media sosial dengan topik: "${topic}". Gaya penulisannya harus ${styleEl.value}. ${maxCharsEl.value ? `Pastikan setiap bagian TIDAK MELEBIHI ${maxCharsEl.value} karakter.` : ''} Format output harus berupa JSON object dengan satu key "thread" yang berisi array dari string.`;
        try {
            const result = await callGemini(fullPrompt, apiKey);
            if (result && result.thread) {
                currentGeneratedThread = {
                    topic: topic,
                    thread: result.thread,
                    timestamp: new Date().toISOString()
                };
                renderOutput(currentGeneratedThread);
            } else {
                throw new Error("Format respons dari API tidak sesuai.");
            }
        } catch (error) {
            errorOutputEl.textContent = `Terjadi kesalahan: ${error.message}`;
        } finally {
            setLoading(false);
        }
    });

    // --- Initial App Load ---
    initializeApp();
});

