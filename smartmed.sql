-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 06 mai 2026 à 19:31
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `smartmed`
--

-- --------------------------------------------------------

--
-- Structure de la table `profilmedecin`
--

CREATE TABLE `profilmedecin` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `specialite_id` int(11) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `tarif` float DEFAULT NULL,
  `biographie` text DEFAULT NULL,
  `diplome_path` varchar(255) DEFAULT NULL,
  `statut_validation` varchar(20) DEFAULT NULL,
  `spec_nom_temp` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `profilmedecin`
--

INSERT INTO `profilmedecin` (`id`, `user_id`, `specialite_id`, `nom`, `prenom`, `adresse`, `tarif`, `biographie`, `diplome_path`, `statut_validation`, `spec_nom_temp`, `image`) VALUES
(10, 42, 7, 'brg', 'ghaya', 'tunis', 80, '10 ans d\'experience', '', 'VALIDE', 'psychologie', 'ghaya.jpg'),
(15, 58, 6, 'bargougui', 'nadia', 'jerba', 80, '5 ans d\'experience ', NULL, 'VALIDE', 'pediatre', '58_doctorrr.jpg'),
(16, 59, 5, 'hawari', 'yosr', 'ben arous', 90, '10 ans d\'experience', NULL, 'VALIDE', 'gynecologue', '59_yosr.jpg'),
(17, 60, 4, 'saidane', 'ichrak', 'jardain des carthage', 90, '10 ans d\'experience ', NULL, 'VALIDE', 'cardiologue', '60_ichrak.jpg'),
(18, 61, 4, 'slim', 'monji', 'gafsa', 80, '12 ans d\'experience', NULL, 'VALIDE', 'cardiologue', '61_doc3.webp'),
(19, 62, 8, 'brg', 'bargougui', 'kef', 80, '10 ans d\'experience ', NULL, 'VALIDE', 'generaliste', '62_doc5.jpg'),
(20, 63, 4, 'hammami', 'malak', 'bizerte', 90, '10 ans d\'experience', NULL, 'VALIDE', 'cardiologue', '63_doc4.avif');

-- --------------------------------------------------------

--
-- Structure de la table `rendezvous`
--

CREATE TABLE `rendezvous` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `medecin_id` int(11) NOT NULL,
  `date_rdv` varchar(50) DEFAULT NULL,
  `statut` varchar(20) DEFAULT NULL,
  `heure` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `review`
--

CREATE TABLE `review` (
  `id` int(11) NOT NULL,
  `rendezvous_id` int(11) NOT NULL,
  `note` int(11) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `reponse_medecin` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `specialite`
--

CREATE TABLE `specialite` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `mots_cles` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `specialite`
--

INSERT INTO `specialite` (`id`, `nom`, `mots_cles`) VALUES
(1, 'dentsite', NULL),
(4, 'cardiologue', ''),
(5, 'gynecologue', ''),
(6, 'pediatre', ''),
(7, 'psychologie', ''),
(8, 'generaliste', '');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `nom`, `prenom`) VALUES
(40, 'balkis@gmail.com', '$2b$12$6iRaYXAp4/4xdWf7w4OYS.quYiJLr/uRrz1QzeTtpFMZnPBgmGu0m', 'ADMIN', 'balkis', 'hamdi'),
(41, 'ahmed@gmail.com', '$2b$12$glDghywWQWfCRne355Sh7eB1oUZEzo5HWY1AY3iN7.8s/RAjUgt9e', 'PATIENT', 'bargougui', 'ahmed'),
(42, 'ghaya@gmail.com', '$2b$12$2BaVqzloGhkRa.AvwQPMieJldqJwXdI3nb1UFhUey2UJOXAhH3jo6', 'MEDECIN', 'brg', 'ghaya'),
(56, 'lotfi@gmail.com', '$2b$12$OZa0PXXwx3ChUj7rfnXqAu73QAnU32F7p9.xrD5MIf8MXbcZdl5WK', 'PATIENT', 'lotfi', 'bouchnek'),
(58, 'nadia@gmail.com', '$2b$12$4IEfx6qQ3yOom6xtXDRnvu0AFFJJS5ttIhqnVCTwFXEH5M5qMJfra', 'MEDECIN', 'bargougui', 'nadia'),
(59, 'yosr@gmail.com', '$2b$12$hV4BTWdwaD2m65WLckEkAOg8arUCHaeGpgnmmhm1abKGCGo5NkEgC', 'MEDECIN', 'hawari', 'yosr'),
(60, 'ichrak@gmail.com', '$2b$12$lIyJvJHQ1h0fXAaZ.DHYzeLa8YZzgi696movA4jKjffxXWo2dRrgu', 'MEDECIN', 'saidane', 'ichrak'),
(61, 'monji@gmail.com', '$2b$12$G/7mWrPB.V4aR15kMlMQ9.eQ03tke1IVVUDjGsw5uQvVmlDyURnI6', 'MEDECIN', 'slim', 'monji'),
(62, 'sabrin@gmail.com', '$2b$12$f6LcfkXmMoLzjdCV0Gnai.5PKKOLCA9q8SGKGehjlBmoiJ0ZkAyS6', 'MEDECIN', 'brg', 'bargougui'),
(63, 'malak@gmail.com', '$2b$12$y1urw6splY.EcNADdnUOp.GJ/3B/ZfNygWSy6thZrZsyyv6p10HhG', 'MEDECIN', 'hammami', 'malak');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `profilmedecin`
--
ALTER TABLE `profilmedecin`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_profil_user` (`user_id`),
  ADD KEY `fk_profil_specialite` (`specialite_id`);

--
-- Index pour la table `rendezvous`
--
ALTER TABLE `rendezvous`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rdv_patient` (`patient_id`),
  ADD KEY `fk_rdv_medecin` (`medecin_id`);

--
-- Index pour la table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_review_rdv` (`rendezvous_id`);

--
-- Index pour la table `specialite`
--
ALTER TABLE `specialite`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `profilmedecin`
--
ALTER TABLE `profilmedecin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `rendezvous`
--
ALTER TABLE `rendezvous`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `review`
--
ALTER TABLE `review`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `specialite`
--
ALTER TABLE `specialite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `profilmedecin`
--
ALTER TABLE `profilmedecin`
  ADD CONSTRAINT `fk_profil_specialite` FOREIGN KEY (`specialite_id`) REFERENCES `specialite` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_profil_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `rendezvous`
--
ALTER TABLE `rendezvous`
  ADD CONSTRAINT `fk_rdv_medecin` FOREIGN KEY (`medecin_id`) REFERENCES `profilmedecin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rdv_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `fk_review_rdv` FOREIGN KEY (`rendezvous_id`) REFERENCES `rendezvous` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
