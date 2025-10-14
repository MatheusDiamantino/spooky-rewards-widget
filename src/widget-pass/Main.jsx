import { useEffect, useRef, useState } from 'react';
import './styles.scss';
import { Player } from '@lottiefiles/react-lottie-player';
import FishBoatBlue from './animations/Halloween Bat Floating.json';
import FishBoatOrange from './animations/Halloween Spider.json';
import OneFish from './animations/Halloween Spooky Ghost Floating.json';
import GhostAnimation from './animations/Ghost Green.json';
import Missions from '../widget-mission/main.jsx';

export const calculatePointsProgress = (ach_points, required_points) => {
	return required_points > 0 ? Math.min(parseInt(((ach_points * 100) / required_points).toFixed(0), 0), 100) : 100;
};

const dataValueConfig = (dataValue) => {
	if (typeof dataValue === 'number') {
		return `${dataValue}%`;
	}
	if (typeof dataValue === 'boolean') {
		return dataValue ? 'Yes' : 'No';
	}
	return dataValue;
};

const SCROLL_OFFSET = 200;

const fishPositions = [
	
	{ top: '280px', right: '60px', transform: 'rotateY(180deg)' },
	{ top: '280px', left: '60px' },
	{ top: '200px', left: '50px', transform: 'rotateY(180deg)' },
	{ top: '135px', left: '135px', transform: 'rotateY(180deg)' },
	
];

const animations = [
	{ key: 'FishBoatBlue', src: FishBoatBlue, style: { bottom: '140px', left: '26px', 'pointer-events': 'none' } },
	{ key: 'FishBoatOrange', src: FishBoatOrange, style: { bottom: '90%', right: '112px', transform: 'rotateY(180deg)' } },
	{ key: 'OneFish', src: OneFish, style: fishPositions[0] },
];

const getRandomPosition = () => {
	const randomIndex = Math.floor(Math.random() * fishPositions.length);
	return fishPositions[randomIndex];
};

// Helper para resolver a imagem da ilha por nível/índice
const getLevelImageUrl = (level, disabled, index) => {
    if (!level) return '';
    // Conjunto de imagens ativas disponíveis (inclui as que faltavam)
    const activeImages = [
        'https://casa.example.com/CRM/Widgets+CRM/Halloween+Map/img/JOGUE E CONCORRA.webp',
        'https://casa.example.com/CRM/Widgets+CRM/Halloween+Map/img/caldeirao.webp',
        'https://casa.example.com/CRM/Widgets+CRM/Halloween+Map/img/bau-diario.webp',
        'https://casa.example.com/CRM/Widgets+CRM/Halloween+Map/img/TORNEIOS.webp',
    ];
    const i = Number.isFinite(index) ? index % activeImages.length : 0;
    const activeUrl = activeImages[i];
    return activeUrl;
};

const LevelMap = () => {
	const [loading, setLoading] = useState(true);
	const [levels, setLevels] = useState([]);
	const levelContainerRef = useRef(null);
	const [showCard, setShowCard] = useState(false);
	const [currentLevel, setCurrentLevel] = useState(null);
	const animationRef = useRef(null);
	const [fishPosition, setFishPosition] = useState(fishPositions[0]);

	const smarticoApi = window._smartico.api;

	useEffect(() => {
		const loadData = async () => {
			const levelsResponse = await smarticoApi.getLevels();

			setLevels(levelsResponse);
			setLoading(false);
		};

		loadData();
	}, [smarticoApi]);

	useEffect(() => {
		if (!loading && levelContainerRef.current) {
			levelContainerRef.current.scrollTop = levelContainerRef.current.scrollHeight;
		}
	}, [loading]);

	const handleAnimationComplete = () => {
		const newPosition = getRandomPosition();
		setFishPosition(newPosition);
	};

	const handleOnClick = (key) => {
		if (animationRef.current && key === 'OneFish') {
			window._smartico.action('FISH');
		}
	};

	const scrollContainer = (scrollOffset) => {
		if (levelContainerRef.current) {
			levelContainerRef.current.scrollBy({
				top: scrollOffset,
				behavior: 'smooth',
			});
		}
	};

	const handleScrollUp = () => {
		scrollContainer(-SCROLL_OFFSET);
	};

	const handleScrollDown = () => {
		scrollContainer(SCROLL_OFFSET);
	};

	const handleMouseDown = (e) => {
		if (levelContainerRef.current) {
			levelContainerRef.current.isDragging = true;
			levelContainerRef.current.startY = e.clientY;
			levelContainerRef.current.scrollStartY = levelContainerRef.current.scrollTop;
			levelContainerRef.current.classList.add('dragging');
		}
	};

	const handleMouseMove = (e) => {
		if (levelContainerRef.current && levelContainerRef.current.isDragging) {
			const dy = e.clientY - levelContainerRef.current.startY;
			levelContainerRef.current.scrollTop = levelContainerRef.current.scrollStartY - dy;
		}
	};

	const handleMouseUp = () => {
		if (levelContainerRef.current) {
			levelContainerRef.current.isDragging = false;
			levelContainerRef.current.classList.remove('dragging');
		}
	};

	const handleMouseLeave = () => {
		if (levelContainerRef.current) {
			levelContainerRef.current.isDragging = false;
			levelContainerRef.current.classList.remove('dragging');
		}
	};

	if (loading) {
		return null;
	}

	return (
		<div className="levels-wrapper">
			<div className="levels-content-overlay" />
			<div className="levels-container" ref={levelContainerRef} onMouseDown={handleMouseDown} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
				<div className="levels-content">
					<div className="levels-main-background">
						<div className="levels-map-road" />
						<div className="level-items-container">
							{levels
								.sort((a, b) => a.id - b.id)
								.slice(0, 4)
								.map((level, index) => (
									<div key={level.id}>
										<LevelItem level={level} index={index} setShowCard={setShowCard} setCurrentLevel={setCurrentLevel} />
									</div>
								))}
						</div>
					</div>
					<div>
						{animations.map((animation) => (
							<div
								className={`animation-container ${animation.key === 'OneFish' ? 'fish' : ''}`}
								key={animation.key}
								style={animation.key === 'OneFish' ? fishPosition : animation.style}
								onClick={() => handleOnClick(animation.key)}
							>
								<Player
									ref={animation.key === 'OneFish' ? animationRef : null}
									src={animation.src}
									style={{ width: '100%', height: '100%' }}
									autoplay={true}
									loop={true}
									background="transparent"
									onEvent={(event) => {
										if (event === 'loop' && animation.key === 'OneFish') {
											handleAnimationComplete();
										}
									}}
								></Player>
							</div>
						))}
					</div>
				</div>
			</div>
			{showCard && currentLevel && <LevelCardModal level={currentLevel} showCard={showCard} setShowCard={setShowCard} levelIndex={levels.indexOf(currentLevel)} />}
			<div className="levels-scroll-buttons">
				<div className="button-container" onClick={handleScrollUp}>
					<div className="button-nav up" />
				</div>
				<div className="button-container" onClick={handleScrollDown}>
					<div className="button-nav down" />
				</div>
			</div>
			<div className="levels-hint-message">
				<div className="hint-container">
					<div className="hint-icon" />
					<div className="hint-message">Drag up and down to navigate the page</div>
				</div>
			</div>
		</div>
	);
};

export default LevelMap;

const LevelItem = ({ level, index, setShowCard, setCurrentLevel }) => {
	if (level === undefined) {
		return null;
	}

    const ach_points = 150;
    const pointsProgress = calculatePointsProgress(ach_points, level.required_points);
    // Todos desbloqueados
    const disabled = false;

	const handleClick = () => {
		if (disabled) return; // bloqueado: não abre modal
		setCurrentLevel(level);
		setShowCard(true);
	};

    const imageUrl = getLevelImageUrl(level, disabled, index);
	if (!imageUrl) {
		console.warn('Level image not found for level:', level?.id, level?.name, level?.custom_data);
	}

	return (
		<>
			<div
				key={level.id}
				className={`level-item level-${index} ${disabled ? 'disabled' : ''}`}
				onClick={disabled ? undefined : handleClick}
				aria-disabled={disabled}
				title={disabled ? 'Bloqueado' : level.name}
			>
                {index === 1 && (
                    <div className="ghost-animation">
                        <Player
                            src={GhostAnimation}
                            style={{ width: '100%', height: '100%' }}
                            autoplay={true}
                            loop={true}
                            background="transparent"
                        />
                    </div>
                )}
				<div className="level-image" style={imageUrl ? { backgroundImage: `url(${encodeURI(imageUrl)})` } : {}} />
				{disabled && <div className="lock-icon" />}
				<div className="level-name">{level.name}</div>
			</div>
		</>
	);
};

const LevelCardModal = ({ level, showCard, setShowCard, levelIndex }) => {
	if (level === undefined) {
		return null;
	}

	return (
		<div className={`level-card-wrapper ${showCard ? 'active' : ''}`}>
			<div className={`level-card`}>
				<div
                  className="level-card-close"
                  onClick={() => setShowCard(false)}
                  role="button"
                  aria-label="Fechar"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowCard(false);
                    }
                  }}
                >
                  <div className="level-card-close-btn" />
                </div>
				<div className="level-card-content">
					<Missions level={level} levelIndex={levelIndex} />
				</div>
			</div>
		</div>
	);
};
