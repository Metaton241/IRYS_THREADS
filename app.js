// Инициализация Irys для хранения данных
let irysInstance = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем наличие подключенного кошелька
    checkWalletConnection();

    // Установка обработчиков событий
    setupEventListeners();
    
    // Если это страница профиля, инициализируем ее
    if (window.location.pathname.includes('profile.html')) {
        initProfilePage();
    }
    
    // Загружаем посты (если мы на главной странице или на странице feed)
    if (window.location.pathname === '/' || 
        window.location.pathname.includes('index.html') || 
        window.location.pathname.includes('feed.html')) {
        loadPosts();
    }

    // Инициализируем анимации
    initAnimations();
});

// Функция для инициализации анимаций
function initAnimations() {
    // Добавляем анимации для постов при прокрутке
    const posts = document.querySelectorAll('.post:not(.animate__animated)');
    if (posts.length > 0 && typeof gsap !== 'undefined') {
        gsap.from(posts, {
            duration: 0.8,
            opacity: 0,
            y: 50,
            stagger: 0.2,
            ease: "power1.out"
        });
    }
}

// Функция проверки подключения кошелька
async function checkWalletConnection() {
    console.log('Проверка подключения кошелька');
    
    // Проверяем, есть ли сохраненный адрес в localStorage
    const savedAddress = localStorage.getItem('walletAddress');
    console.log('Сохраненный адрес:', savedAddress);
    
    if (savedAddress) {
        console.log('Найден сохраненный адрес, обновляем интерфейс');
        updateConnectButton(true, savedAddress);
        
        // Инициализируем Irys
        console.log('Инициализация Irys с сохраненным адресом');
        await initIrys(savedAddress);
    } else {
        console.log('Сохраненный адрес не найден, показываем кнопку подключения');
        updateConnectButton(false);
    }
}

// Устанавливаем обработчики событий
function setupEventListeners() {
    const connectButton = document.getElementById('connect-wallet');
    if (connectButton) {
        connectButton.addEventListener('click', connectWallet);
    }
    
    const submitPostButton = document.getElementById('submit-post');
    if (submitPostButton) {
        submitPostButton.addEventListener('click', createPost);
    }
    
    // Обработчики для страницы профиля
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                switchTab(tabName);
            });
        });
    }
    
    const saveProfileButton = document.getElementById('save-profile');
    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', saveProfileSettings);
    }

    // Добавляем обработчики для кнопок лайка
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('like-button') || e.target.parentElement.classList.contains('like-button')) {
            const button = e.target.classList.contains('like-button') ? e.target : e.target.parentElement;
            const postId = button.getAttribute('data-post-id');
            if (postId) {
                toggleLike(postId, button);
            }
        }
    });

    // Добавляем обработчики для отправки комментариев
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('comment-submit')) {
            const postId = e.target.getAttribute('data-post-id');
            const textarea = e.target.previousElementSibling;
            if (postId && textarea) {
                addComment(postId, textarea.value);
                textarea.value = '';
            }
        }
    });
}

// Инициализация Irys - упрощенная версия
async function initIrys(walletAddress) {
    try {
        if (typeof window.Irys !== 'undefined') {
            console.log('Инициализация Irys (упрощенная версия)...');
            
            if (window.ethereum) {
                console.log('Провайдер для Irys найден');
                
                try {
                    // Использование Irys для подключения к ноде
                    // В реальном приложении нужно добавить проверку баланса и пополнение
                    irysInstance = new window.Irys({
                        url: "https://node2.irys.xyz",
                        token: "ethereum",
                        key: window.ethereum
                    });
                    
                    console.log('Irys успешно инициализирован:', irysInstance);
                    return irysInstance;
                } catch (initError) {
                    console.error('Ошибка при создании экземпляра Irys:', initError);
                    console.error('Стек ошибки:', initError.stack);
                    console.error('Детали ошибки:', JSON.stringify(initError, Object.getOwnPropertyNames(initError)));
                    alert('Ошибка при инициализации Irys. Проверьте консоль для деталей.');
                }
            } else {
                console.error('window.ethereum для Irys не найден');
            }
        } else {
            console.error('Библиотека Irys не загружена');
        }
    } catch (error) {
        console.error('Ошибка при инициализации Irys:', error);
        console.error('Стек ошибки:', error.stack);
        console.error('Детали ошибки:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    return null;
}

// Сохранение данных через Irys
async function saveToIrys(data, tags = []) {
    try {
        if (!irysInstance) {
            console.warn('Irys не инициализирован. Сохраняем локально.');
            return null;
        }

        // Подготовка данных для сохранения
        const dataToSave = JSON.stringify(data);
        
        // Добавляем теги для индексирования
        const uploadTags = [
            { name: 'App-Name', value: 'IrysThreads' },
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Unix-Time', value: Date.now().toString() },
            ...tags
        ];

        // Загрузка данных в Irys
        const receipt = await irysInstance.upload(dataToSave, { tags: uploadTags });
        
        console.log('Данные сохранены в Irys:', receipt.id);
        return receipt.id;
    } catch (error) {
        console.error('Ошибка при сохранении в Irys:', error);
        return null;
    }
}

// Загрузка данных из Irys
async function loadFromIrys(id) {
    try {
        // В реальном приложении здесь будет запрос к Irys
        // Для демонстрации используем локальное хранилище
        return null;
    } catch (error) {
        console.error('Ошибка при загрузке данных из Irys:', error);
        return null;
    }
}

// Определение провайдера кошелька - упрощенная версия
async function detectProvider() {
    console.log('Запуск detectProvider (упрощенная версия)');
    
    try {
        // Проверяем наличие window.ethereum
        if (window.ethereum) {
            console.log('window.ethereum найден:', window.ethereum);
            
            // Проверяем Rabby напрямую
            if (window.ethereum.isRabby) {
                console.log('Найден Rabby через window.ethereum.isRabby');
                return { provider: window.ethereum, name: 'Rabby' };
            }
            
            // Проверка на наличие нескольких провайдеров
            if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
                console.log('Найдено несколько провайдеров в window.ethereum.providers:', window.ethereum.providers);
                
                // Ищем Rabby среди провайдеров
                for (const provider of window.ethereum.providers) {
                    console.log('Проверяем провайдер:', provider);
                    if (provider && provider.isRabby) {
                        console.log('Найден Rabby в window.ethereum.providers');
                        return { provider, name: 'Rabby' };
                    }
                }
                
                // Если Rabby не найден, используем первый доступный
                if (window.ethereum.providers.length > 0) {
                    console.log('Rabby не найден, используем первый доступный провайдер из providers');
                    return { provider: window.ethereum.providers[0], name: 'Web3' };
                }
            }
            
            // Если есть только один провайдер
            console.log('Используем window.ethereum как провайдер');
            return { provider: window.ethereum, name: window.ethereum.isMetaMask ? 'MetaMask' : 'Web3' };
        }
        
        // Если провайдеров нет
        console.log('window.ethereum не найден');
        return { provider: null, name: null };
    } catch (error) {
        console.error('Ошибка при определении провайдера:', error);
        console.error('Стек ошибки:', error.stack);
        return { provider: null, name: null };
    }
}

// Функция подключения кошелька - упрощенная версия
async function connectWallet() {
    try {
        console.log('Запуск connectWallet (упрощенная версия)');
        
        // Проверяем наличие ethereum провайдера напрямую
        if (!window.ethereum) {
            console.error('window.ethereum не найден');
            alert('Для использования Irys Threads необходим Rabby или другой Web3 кошелек. Пожалуйста, установите расширение Rabby для вашего браузера.');
            window.open('https://rabby.io/', '_blank');
            return null;
        }
        
        console.log('window.ethereum найден:', window.ethereum);
        
        try {
            // Запрашиваем доступ к аккаунтам напрямую
            console.log('Запрос аккаунтов...');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Полученные аккаунты:', accounts);
            
            if (!accounts || accounts.length === 0) {
                console.error('Ошибка: не получены аккаунты');
                alert('Не удалось получить адрес кошелька. Пожалуйста, убедитесь, что кошелек разблокирован и разрешен доступ.');
                return null;
            }
            
            const walletAddress = accounts[0];
            console.log('Используем адрес:', walletAddress);
            
            // Определяем тип кошелька
            let walletType = 'Web3';
            if (window.ethereum.isRabby) {
                walletType = 'Rabby';
            } else if (window.ethereum.isMetaMask) {
                walletType = 'MetaMask';
            }
            
            // Сохраняем адрес в localStorage
            localStorage.setItem('walletAddress', walletAddress);
            localStorage.setItem('walletType', walletType);
            console.log('Данные кошелька сохранены в localStorage:', { walletAddress, walletType });
            
            // Обновляем интерфейс немедленно
            updateConnectButton(true, walletAddress);
            
            // Инициализируем Irys
            console.log('Инициализация Irys...');
            await initIrys(walletAddress);
            
            // Сохраняем пользователя
            console.log('Сохранение данных пользователя...');
            await saveUserToIrys(walletAddress);
            
            // Обновляем интерфейс еще раз после всех операций
            updateConnectButton(true, walletAddress);
            
            return walletAddress;
        } catch (error) {
            console.error('Ошибка при подключении к кошельку:', error);
            console.error('Стек ошибки:', error.stack);
            console.error('Детали ошибки:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            alert(`Произошла ошибка при подключении к кошельку. Пожалуйста, проверьте консоль для деталей.`);
            return null;
        }
    } catch (error) {
        console.error('Неизвестная ошибка при подключении кошелька:', error);
        console.error('Стек ошибки:', error.stack);
        console.error('Детали ошибки:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        alert('Произошла неизвестная ошибка при подключении кошелька.');
        return null;
    }
}

// Функция для обновления интерфейса кнопки подключения
function updateConnectButton(isConnected, walletAddress = '') {
    console.log('Обновление интерфейса кнопки подключения');
    
    // Проверяем, на какой странице мы находимся
    const isFeedPage = window.location.pathname.includes('feed.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    const isProfilePage = window.location.pathname.includes('profile.html');
    const isLandingPage = window.location.pathname.includes('index.html') || (!isFeedPage && !isProfilePage);
    
    console.log('Текущая страница:', {
        path: window.location.pathname,
        isFeedPage,
        isProfilePage,
        isLandingPage
    });
    
    // Обработка для страницы feed.html
    if (isFeedPage) {
        const connectButton = document.getElementById('connect-wallet');
        const userInfoDiv = document.getElementById('user-info');
        const walletAddressSpan = document.getElementById('wallet-address');
        
        if (connectButton && userInfoDiv && walletAddressSpan) {
            if (isConnected) {
                connectButton.style.display = 'none';
                userInfoDiv.style.display = 'flex';
                walletAddressSpan.textContent = formatAddress(walletAddress);
                
                // Показываем форму создания поста
                const createPostContainer = document.getElementById('create-post-container');
                if (createPostContainer) {
                    createPostContainer.style.display = 'block';
                }
            } else {
                connectButton.style.display = 'block';
                userInfoDiv.style.display = 'none';
                
                // Скрываем форму создания поста
                const createPostContainer = document.getElementById('create-post-container');
                if (createPostContainer) {
                    createPostContainer.style.display = 'none';
                }
            }
        } else {
            console.log('Не найдены элементы интерфейса для feed.html');
        }
    }
    
    // Обработка для страницы profile.html
    if (isProfilePage) {
        const profileWalletAddress = document.getElementById('profile-wallet-address');
        if (profileWalletAddress && isConnected) {
            profileWalletAddress.textContent = formatAddress(walletAddress);
        }
    }
    
    // Обработка для landing page (index.html)
    if (isLandingPage) {
        const connectButtons = [
            document.getElementById('connect-wallet-landing'),
            document.getElementById('connect-wallet-hero'),
            document.getElementById('connect-wallet-cta')
        ];
        
        // Создаем или обновляем элемент для отображения адреса кошелька
        const walletInfoContainer = document.getElementById('wallet-info-container') || createWalletInfoContainer();
        
        if (isConnected) {
            // Скрываем все кнопки подключения
            connectButtons.forEach(button => {
                if (button) {
                    button.style.display = 'none';
                }
            });
            
            // Показываем информацию о кошельке
            walletInfoContainer.style.display = 'flex';
            const walletAddressElement = walletInfoContainer.querySelector('.wallet-address');
            if (walletAddressElement) {
                walletAddressElement.textContent = formatAddress(walletAddress);
            }
        } else {
            // Показываем кнопки подключения
            connectButtons.forEach(button => {
                if (button) {
                    button.style.display = 'block';
                    button.textContent = 'Подключить кошелек';
                    button.classList.remove('connected');
                }
            });
            
            // Скрываем информацию о кошельке
            walletInfoContainer.style.display = 'none';
        }
    }
}

// Функция для создания контейнера с информацией о кошельке
function createWalletInfoContainer() {
    // Проверяем, существует ли уже контейнер
    let container = document.getElementById('wallet-info-container');
    if (container) return container;
    
    // Создаем новый контейнер
    container = document.createElement('div');
    container.id = 'wallet-info-container';
    container.className = 'wallet-info-container';
    container.style.display = 'none';
    
    // Добавляем содержимое
    container.innerHTML = `
        <div class="wallet-icon"><i class="fas fa-wallet"></i></div>
        <div class="wallet-details">
            <div class="wallet-label">Кошелек подключен</div>
            <div class="wallet-address"></div>
        </div>
    `;
    
    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        .wallet-info-container {
            display: flex;
            align-items: center;
            background-color: rgba(255, 69, 0, 0.1);
            border: 1px solid #FF4500;
            border-radius: 8px;
            padding: 8px 12px;
            margin: 10px 0;
            color: #FF4500;
        }
        .wallet-icon {
            margin-right: 10px;
            font-size: 1.2em;
        }
        .wallet-details {
            display: flex;
            flex-direction: column;
        }
        .wallet-label {
            font-size: 0.8em;
            opacity: 0.8;
        }
        .wallet-address {
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
    
    // Находим место для вставки контейнера
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.appendChild(container);
    } else {
        // Если не найден .auth-buttons, добавляем в body
        document.body.appendChild(container);
    }
    
    return container;
}

// Функция для сохранения пользователя
async function saveUserToIrys(walletAddress) {
    try {
        // Проверяем, существует ли пользователь уже
        const userExists = localStorage.getItem(`user_${walletAddress}`);
        
        if (!userExists) {
            const userData = {
                address: walletAddress,
                joinDate: new Date().toISOString(),
                displayName: '',
                bio: '',
                avatar: ''
            };
            
            // Сохраняем в Irys
            const irysId = await saveToIrys(userData, [
                { name: 'Content-Type', value: 'application/json' },
                { name: 'Data-Type', value: 'user-profile' },
                { name: 'User-Address', value: walletAddress }
            ]);
            
            // Если не удалось сохранить в Irys, сохраняем локально
            if (!irysId) {
                localStorage.setItem(`user_${walletAddress}`, JSON.stringify(userData));
            } else {
                // Сохраняем ссылку на данные в Irys
                userData.irysId = irysId;
                localStorage.setItem(`user_${walletAddress}`, JSON.stringify(userData));
            }
        }
    } catch (error) {
        console.error('Ошибка при сохранении пользователя:', error);
    }
}

// Отправка платежа в IRYS для создания треда - упрощенная версия
async function sendIrysPayment(senderAddress, recipientAddress, amount) {
    try {
        console.log('Запуск sendIrysPayment (упрощенная версия)');
        console.log('Отправитель:', senderAddress);
        console.log('Получатель:', recipientAddress);
        console.log('Сумма:', amount);
        
        if (!window.ethereum) {
            console.error('window.ethereum не найден');
            alert('Кошелек не подключен.');
            return false;
        }
        
        console.log('Провайдер для платежа:', window.ethereum);
        
        try {
            // Добавляем сеть Irys Testnet
            console.log('Добавление сети Irys Testnet...');
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x4f6', // 1270 в hex
                    chainName: 'Irys Testnet',
                    nativeCurrency: {
                        name: 'IRYS',
                        symbol: 'IRYS',
                        decimals: 18
                    },
                    rpcUrls: ['https://testnet-rpc.irys.xyz/v1/execution-rpc'],
                    blockExplorerUrls: ['https://testnet.irys.xyz']
                }]
            });
            console.log('Сеть Irys Testnet добавлена');
            
            // Переключаемся на сеть Irys Testnet
            console.log('Переключение на сеть Irys Testnet...');
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x4f6' }]
            });
            console.log('Переключено на сеть Irys Testnet');
            
            // Создаем ethers провайдер и signer
            console.log('Создание ethers провайдера...');
            const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = ethersProvider.getSigner();
            console.log('Ethers провайдер создан');
            
            // Конвертируем сумму в wei
            const amountWei = ethers.utils.parseUnits(amount, 18);
            console.log('Сумма в wei:', amountWei.toString());
            
            // Создаем транзакцию
            const tx = {
                from: senderAddress,
                to: recipientAddress,
                value: amountWei.toHexString(),
                gasLimit: ethers.utils.hexlify(100000),
                gasPrice: await ethersProvider.getGasPrice()
            };
            console.log('Транзакция подготовлена:', tx);
            
            // Отправляем транзакцию
            console.log('Отправка транзакции...');
            const transactionResponse = await signer.sendTransaction(tx);
            console.log('Транзакция отправлена, хеш:', transactionResponse.hash);
            
            alert(`Транзакция отправлена. Хеш: ${transactionResponse.hash}. Ожидаем подтверждения...`);
            
            // Ждем подтверждения транзакции
            console.log('Ожидание подтверждения транзакции...');
            await transactionResponse.wait();
            console.log('Транзакция подтверждена');
            
            alert('Транзакция успешно подтверждена!');
            return true;
        } catch (error) {
            console.error('Ошибка при отправке платежа IRYS:', error);
            console.error('Стек ошибки:', error.stack);
            console.error('Детали ошибки:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            alert(`Ошибка при отправке платежа IRYS: ${error.message}. Пожалуйста, проверьте консоль.`);
            return false;
        }
    } catch (error) {
        console.error('Неизвестная ошибка при отправке платежа:', error);
        console.error('Стек ошибки:', error.stack);
        console.error('Детали ошибки:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        alert('Произошла неизвестная ошибка при отправке платежа.');
        return false;
    }
}

// Функция для создания нового поста
async function createPost() {
    console.log('Запуск createPost');
    const walletAddress = localStorage.getItem('walletAddress');
    
    if (!walletAddress) {
        alert('Пожалуйста, подключите кошелек для создания поста');
        return;
    }
    
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('Пожалуйста, заполните заголовок и содержимое поста');
        return;
    }
    
    try {
        console.log('Начало процесса создания поста');
        
        // Сначала отправляем платеж
        console.log('Запрос на оплату треда');
        const paymentSuccess = await sendIrysPayment(
            walletAddress, 
            '0x601F9e84D3B5621131896dF22268B898729a259F', 
            '0.01'
        );
        
        if (!paymentSuccess) {
            console.log('Платеж не выполнен, отмена создания поста');
            return;
        }
        
        console.log('Платеж выполнен успешно, создаем пост');
        
        // Создаем новый пост
        const postId = Date.now().toString();
        const post = {
            id: postId,
            title: title,
            content: content,
            author: walletAddress,
            createdAt: new Date().toISOString(),
            votes: 0,
            likes: [],
            comments: []
        };
        
        console.log('Пост создан:', post);
        
        // Сохраняем в Irys
        console.log('Сохранение поста в Irys');
        const irysId = await saveToIrys(post, [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Data-Type', value: 'post' },
            { name: 'Post-Title', value: title },
            { name: 'Author', value: walletAddress }
        ]);
        
        // Если сохранение в Irys не удалось, сохраняем локально
        if (irysId) {
            console.log('Пост сохранен в Irys с ID:', irysId);
            post.irysId = irysId;
        } else {
            console.log('Не удалось сохранить пост в Irys, сохраняем локально');
        }
        
        // Получаем существующие посты или создаем новый массив
        const existingPostsString = localStorage.getItem('posts');
        const existingPosts = existingPostsString ? JSON.parse(existingPostsString) : [];
        
        // Добавляем новый пост
        existingPosts.unshift(post);
        
        // Сохраняем обновленный список постов
        localStorage.setItem('posts', JSON.stringify(existingPosts));
        console.log('Пост сохранен в localStorage');
        
        // Очищаем поля ввода
        titleInput.value = '';
        contentInput.value = '';
        
        // Обновляем отображение постов
        loadPosts();
        
        alert('Пост успешно создан!');
    } catch (error) {
        console.error('Ошибка при создании поста:', error);
        console.error('Стек ошибки:', error.stack);
        console.error('Детали ошибки:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        alert('Произошла ошибка при создании поста.');
    }
}

// Функция для загрузки и отображения постов
function loadPosts() {
    const postsContainer = document.getElementById('posts-container');
    
    if (!postsContainer) return;
    
    // Получаем посты из localStorage
    const postsString = localStorage.getItem('posts');
    let posts = postsString ? JSON.parse(postsString) : [];
    
    // Если постов нет, добавляем демо-посты для отображения
    if (posts.length === 0) {
        console.log('Постов не найдено, добавляем демо-посты');
        posts = createDemoPosts();
        localStorage.setItem('posts', JSON.stringify(posts));
    }
    
    // Очищаем контейнер перед добавлением постов
    postsContainer.innerHTML = '';
    
    // Получаем адрес текущего пользователя
    const currentUserAddress = localStorage.getItem('walletAddress');
    
    // Добавляем каждый пост в контейнер
    posts.forEach(post => {
        const timeAgo = formatTimeAgo(new Date(post.createdAt));
        
        // Определяем, лайкнул ли текущий пользователь этот пост
        const isLiked = post.likes && post.likes.includes(currentUserAddress);
        const likeButtonClass = isLiked ? 'like-button active' : 'like-button';
        
        const postElement = document.createElement('div');
        postElement.className = 'post animate__animated animate__fadeIn';
        postElement.innerHTML = `
            <div class="post-votes">
                <button class="vote-btn upvote" data-post-id="${post.id}">▲</button>
                <span class="vote-count">${post.votes}</span>
                <button class="vote-btn downvote" data-post-id="${post.id}">▼</button>
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-text">${post.content}</p>
                <div class="post-meta">
                    <span class="post-author">Автор: ${formatAddress(post.author)}</span>
                    <span class="post-time">${timeAgo}</span>
                    <button class="${likeButtonClass}" data-post-id="${post.id}">
                        <i class="fas fa-heart"></i> 
                        ${post.likes ? post.likes.length : 0} Нравится
                    </button>
                    <button class="toggle-comments-btn" data-post-id="${post.id}">
                        ${post.comments ? post.comments.length : 0} Комментариев
                    </button>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <div class="comment-form">
                        <textarea placeholder="Оставьте комментарий..."></textarea>
                        <button class="comment-submit" data-post-id="${post.id}">Отправить</button>
                    </div>
                    <div class="comments-list" id="comments-list-${post.id}">
                        ${renderComments(post.comments || [])}
                    </div>
                </div>
            </div>
        `;
        
        postsContainer.appendChild(postElement);
        
        // Добавляем обработчики для голосования
        const upvoteBtn = postElement.querySelector('.upvote');
        const downvoteBtn = postElement.querySelector('.downvote');
        
        upvoteBtn.addEventListener('click', () => votePost(post.id, 1));
        downvoteBtn.addEventListener('click', () => votePost(post.id, -1));
        
        // Добавляем обработчик для отображения комментариев
        const toggleCommentsBtn = postElement.querySelector('.toggle-comments-btn');
        toggleCommentsBtn.addEventListener('click', () => {
            const commentsSection = document.getElementById(`comments-${post.id}`);
            if (commentsSection) {
                const isVisible = commentsSection.style.display !== 'none';
                commentsSection.style.display = isVisible ? 'none' : 'block';
                if (!isVisible) {
                    // Анимируем появление
                    gsap.from(commentsSection, {
                        duration: 0.5,
                        height: 0,
                        opacity: 0,
                        ease: "power1.out"
                    });
                }
            }
        });
    });

    // Инициализируем анимации для новых постов
    initAnimations();
}

// Функция для рендеринга комментариев
function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<p class="empty-state">Нет комментариев. Будьте первым!</p>';
    }
    
    return comments.map(comment => {
        const timeAgo = formatTimeAgo(new Date(comment.createdAt));
        return `
            <div class="comment animate__animated animate__fadeIn">
                <div class="comment-header">
                    <span class="comment-author">${formatAddress(comment.author)}</span>
                    <span class="comment-time">${timeAgo}</span>
                </div>
                <div class="comment-content">
                    ${comment.text}
                </div>
            </div>
        `;
    }).join('');
}

// Function for adding a comment
async function addComment(postId, commentText) {
    const walletAddress = localStorage.getItem('walletAddress');
    
    if (!walletAddress) {
        alert('Please connect your wallet to comment');
        return;
    }
    
    commentText = commentText.trim();
    if (!commentText) {
        alert('Please enter a comment text');
        return;
    }
    
    try {
        // Payment process for commenting
        const commentCost = '0.005'; // IRYS tokens
        const recipientAddress = '0x601F9e84D3B5621131896dF22268B898729a259F'; // Same as for posts
        
        // Show payment confirmation dialog
        const confirmPayment = confirm(`Commenting costs ${commentCost} IRYS tokens. Do you want to proceed with the payment?`);
        
        if (!confirmPayment) {
            alert('Comment cancelled');
            return;
        }
        
        // Process the payment
        console.log('Processing payment for comment...');
        const paymentSuccess = await sendIrysPayment(
            walletAddress,
            recipientAddress,
            commentCost
        );
        
        if (!paymentSuccess) {
            console.log('Payment failed, comment cancelled');
            alert('Payment failed. Your comment was not published.');
            return;
        }
        
        console.log('Payment successful, creating comment');
        
        // Create new comment
        const comment = {
            id: Date.now().toString(),
            postId: postId,
            author: walletAddress,
            text: commentText,
            createdAt: new Date().toISOString(),
            paid: true,
            paymentAmount: commentCost
        };
        
        // Save to Irys
        const irysId = await saveToIrys(comment, [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Data-Type', value: 'comment' },
            { name: 'Post-ID', value: postId },
            { name: 'Author', value: walletAddress }
        ]);
        
        if (irysId) {
            comment.irysId = irysId;
        }
        
        // Get existing posts
        const postsString = localStorage.getItem('posts');
        const posts = postsString ? JSON.parse(postsString) : [];
        
        // Find the post to add the comment to
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
            // Add comment to post
            if (!posts[postIndex].comments) {
                posts[postIndex].comments = [];
            }
            posts[postIndex].comments.push(comment);
            
            // Save updated posts
            localStorage.setItem('posts', JSON.stringify(posts));
            
            // Update comment display
            const commentsList = document.getElementById(`comments-list-${postId}`);
            if (commentsList) {
                commentsList.innerHTML = renderComments(posts[postIndex].comments);
            }
            
            // Update comment counter
            const commentButton = document.querySelector(`.toggle-comments-btn[data-post-id="${postId}"]`);
            if (commentButton) {
                commentButton.textContent = `${posts[postIndex].comments.length} Comments`;
            }
            
            alert('Comment successfully published!');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('An error occurred while adding your comment');
    }
}

// Function for toggling likes
async function toggleLike(postId, button) {
    const walletAddress = localStorage.getItem('walletAddress');
    
    if (!walletAddress) {
        alert('Please connect your wallet to like posts');
        return;
    }
    
    try {
        // Get existing posts
        const postsString = localStorage.getItem('posts');
        const posts = postsString ? JSON.parse(postsString) : [];
        
        // Find the post
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
            // Initialize likes array if it doesn't exist
            if (!posts[postIndex].likes) {
                posts[postIndex].likes = [];
            }
            
            // Check if user already liked the post
            const likeIndex = posts[postIndex].likes.indexOf(walletAddress);
            
            if (likeIndex === -1) {
                // Add like
                posts[postIndex].likes.push(walletAddress);
                button.classList.add('active');
            } else {
                // Remove like
                posts[postIndex].likes.splice(likeIndex, 1);
                button.classList.remove('active');
            }
            
            // Update button text
            button.innerHTML = `<i class="fas fa-heart"></i> ${posts[postIndex].likes.length} Likes`;
            
            // Save changes
            localStorage.setItem('posts', JSON.stringify(posts));
            
            // Save changes to Irys
            if (posts[postIndex].irysId) {
                await saveToIrys(posts[postIndex], [
                    { name: 'Content-Type', value: 'application/json' },
                    { name: 'Data-Type', value: 'post-update' },
                    { name: 'Post-ID', value: postId },
                    { name: 'Update-Type', value: 'likes' }
                ]);
            }
        }
    } catch (error) {
        console.error('Error processing like:', error);
        alert('An error occurred while processing your like');
    }
}

// Function for voting on posts
function votePost(postId, voteValue) {
    const walletAddress = localStorage.getItem('walletAddress');
    
    if (!walletAddress) {
        alert('Please connect your wallet to vote');
        return;
    }
    
    // Get current posts
    const postsString = localStorage.getItem('posts');
    const posts = postsString ? JSON.parse(postsString) : [];
    
    // Find the post
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        // Check if user already voted for this post
        const userVotesKey = `votes_${walletAddress}`;
        const userVotesString = localStorage.getItem(userVotesKey);
        const userVotes = userVotesString ? JSON.parse(userVotesString) : {};
        
        if (userVotes[postId] === voteValue) {
            // User cancels their vote
            posts[postIndex].votes -= voteValue;
            delete userVotes[postId];
        } else {
            // If user already voted, subtract previous vote
            if (userVotes[postId]) {
                posts[postIndex].votes -= userVotes[postId];
            }
            
            // Add new vote
            posts[postIndex].votes += voteValue;
            userVotes[postId] = voteValue;
        }
        
        // Save updated data
        localStorage.setItem('posts', JSON.stringify(posts));
        localStorage.setItem(userVotesKey, JSON.stringify(userVotes));
        
        // Update display
        loadPosts();
    }
}

// Initialize profile page
function initProfilePage() {
    const walletAddress = localStorage.getItem('walletAddress');
    
    if (!walletAddress) {
        // If user is not authorized, redirect to home page
        window.location.href = 'index.html';
        return;
    }
    
    // Set wallet address in profile
    const profileWalletAddress = document.getElementById('profile-wallet-address');
    if (profileWalletAddress) {
        profileWalletAddress.textContent = formatAddress(walletAddress);
    }
    
    // Load user information
    const userDataString = localStorage.getItem(`user_${walletAddress}`);
    if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Set registration date
        const joinDateElement = document.getElementById('join-date');
        if (joinDateElement && userData.joinDate) {
            joinDateElement.textContent = new Date(userData.joinDate).toLocaleDateString();
        }
        
        // Fill profile settings form
        const displayNameInput = document.getElementById('display-name');
        const bioInput = document.getElementById('profile-bio');
        
        if (displayNameInput && userData.displayName) {
            displayNameInput.value = userData.displayName;
        }
        
        if (bioInput && userData.bio) {
            bioInput.value = userData.bio;
        }
        
        // Set avatar if available
        const profileImage = document.getElementById('profile-image');
        if (profileImage && userData.avatar) {
            profileImage.src = userData.avatar;
        }
    }
    
    // Load user posts
    loadUserPosts(walletAddress);
}

// Function for loading user posts
function loadUserPosts(walletAddress) {
    const userPostsContainer = document.getElementById('user-posts');
    
    if (!userPostsContainer) return;
    
    // Get all posts
    const postsString = localStorage.getItem('posts');
    const allPosts = postsString ? JSON.parse(postsString) : [];
    
    // Filter user posts
    const userPosts = allPosts.filter(post => post.author === walletAddress);
    
    // If user has no posts, show message
    if (userPosts.length === 0) {
        userPostsContainer.innerHTML = '<p class="empty-state animate__animated animate__fadeIn">You don\'t have any posts yet.</p>';
        return;
    }
    
    // Clear container before adding posts
    userPostsContainer.innerHTML = '';
    
    // Add each user post
    userPosts.forEach(post => {
        const timeAgo = formatTimeAgo(new Date(post.createdAt));
        
        const postElement = document.createElement('div');
        postElement.className = 'post animate__animated animate__fadeIn';
        postElement.innerHTML = `
            <div class="post-votes">
                <span class="vote-count">${post.votes}</span>
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-text">${post.content}</p>
                <div class="post-meta">
                    <span class="post-time">${timeAgo}</span>
                    <span class="post-likes">
                        <i class="fas fa-heart"></i> ${post.likes ? post.likes.length : 0} Likes
                    </span>
                    <span class="post-comments">
                        <i class="fas fa-comment"></i> ${post.comments ? post.comments.length : 0} Comments
                    </span>
                </div>
            </div>
        `;
        
        userPostsContainer.appendChild(postElement);
    });
}

// Функция для переключения вкладок на странице профиля
function switchTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Удаляем активный класс у всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    document.getElementById(`${tabName}-tab`).style.display = 'block';
    
    // Добавляем активный класс к кнопке
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
}

// Функция для сохранения настроек профиля
function saveProfileSettings() {
    const walletAddress = localStorage.getItem('walletAddress');
    
    if (!walletAddress) {
        alert('Необходимо подключить кошелек');
        return;
    }
    
    const displayName = document.getElementById('display-name').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const avatarInput = document.getElementById('profile-avatar');
    
    // Получаем текущие данные пользователя
    const userDataString = localStorage.getItem(`user_${walletAddress}`);
    const userData = userDataString ? JSON.parse(userDataString) : {
        address: walletAddress,
        joinDate: new Date().toISOString()
    };
    
    // Обновляем данные
    userData.displayName = displayName;
    userData.bio = bio;
    
    // Обрабатываем загрузку аватара, если файл был выбран
    if (avatarInput.files && avatarInput.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            userData.avatar = e.target.result;
            
            // Обновляем аватар на странице
            const profileImage = document.getElementById('profile-image');
            if (profileImage) {
                profileImage.src = e.target.result;
            }
            
            // Сохраняем обновленные данные
            localStorage.setItem(`user_${walletAddress}`, JSON.stringify(userData));
            
            // Сохраняем в Irys
            saveToIrys(userData, [
                { name: 'Content-Type', value: 'application/json' },
                { name: 'Data-Type', value: 'user-profile-update' },
                { name: 'User-Address', value: walletAddress }
            ]);
            
            alert('Настройки профиля успешно сохранены');
        };
        
        reader.readAsDataURL(avatarInput.files[0]);
    } else {
        // Сохраняем обновленные данные без изменения аватара
        localStorage.setItem(`user_${walletAddress}`, JSON.stringify(userData));
        
        // Сохраняем в Irys
        saveToIrys(userData, [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Data-Type', value: 'user-profile-update' },
            { name: 'User-Address', value: walletAddress }
        ]);
        
        alert('Настройки профиля успешно сохранены');
    }
}

// Вспомогательные функции

// Форматирование адреса кошелька (сокращение для отображения)
function formatAddress(address) {
    if (!address) return '';
    return address.substring(0, 2) + '...' + address.substring(address.length - 5);
}

// Функция для создания демо-постов
function createDemoPosts() {
    const demoAddress = '0x7890abcdef1234567890abcdef123456789012345';
    const now = new Date();
    
    return [
        {
            id: '1000001',
            title: 'Добро пожаловать в Irys Threads!',
            content: 'Это демонстрационная платформа для обсуждений на блокчейне. Здесь вы можете создавать посты, комментировать и голосовать за контент других пользователей. Все данные хранятся децентрализованно с использованием технологии Irys.',
            author: demoAddress,
            createdAt: new Date(now - 86400000 * 2).toISOString(), // 2 дня назад
            votes: 15,
            likes: [],
            comments: [
                {
                    id: 'c1001',
                    postId: '1000001',
                    author: '0x1234567890abcdef1234567890abcdef12345678',
                    text: 'Отличная платформа! Очень нравится идея децентрализованного хранения данных.',
                    createdAt: new Date(now - 43200000).toISOString() // 12 часов назад
                }
            ]
        },
        {
            id: '1000002',
            title: 'Как использовать криптокошелек Rabby',
            content: 'Rabby - это современный криптокошелек для взаимодействия с децентрализованными приложениями. Для начала работы установите расширение Rabby из официального магазина расширений вашего браузера, создайте новый кошелек или импортируйте существующий, и вы готовы к использованию!',
            author: demoAddress,
            createdAt: new Date(now - 86400000).toISOString(), // 1 день назад
            votes: 8,
            likes: [],
            comments: []
        },
        {
            id: '1000003',
            title: 'Что такое Irys?',
            content: 'Irys - это децентрализованная платформа для постоянного хранения данных. Она использует технологию блокчейн для обеспечения неизменности и доступности информации. В отличие от традиционных серверов, данные в Irys невозможно удалить или изменить, что делает эту технологию идеальной для хранения важной информации.',
            author: '0x1234567890abcdef1234567890abcdef12345678',
            createdAt: new Date(now - 172800000).toISOString(), // 2 дня назад
            votes: 12,
            likes: [],
            comments: []
        }
    ];
}

// Форматирование времени "прошло с момента"
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
        return `${diffSec} сек. назад`;
    } else if (diffMin < 60) {
        return `${diffMin} мин. назад`;
    } else if (diffHour < 24) {
        return `${diffHour} ч. назад`;
    } else if (diffDay < 30) {
        return `${diffDay} д. назад`;
    } else {
        return date.toLocaleDateString();
    }
}