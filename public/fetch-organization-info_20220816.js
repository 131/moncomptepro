document.addEventListener("DOMContentLoaded", function() {
  var organizationInfoElement = document.getElementById("organization-info");
  var organizationInfoLibelleElement = document.getElementById("organization-info-libelle");
  var organizationInfoAdresseElement = document.getElementById("organization-info-adresse");
  var organizationInfoActivitePrincipaleElement = document.getElementById("organization-info-activite-principale");
  var organizationAlertElement = document.getElementById("organization-alert");
  var findYourSiretHereElement = document.getElementById("find-your-siret-here");
  var siretSelectorElement = document.getElementById("siret-selector");

  function clearOrganizationInfo() {
    findYourSiretHereElement.style.display = "block";
    organizationInfoElement.style.display = "none";
    organizationInfoLibelleElement.innerHTML = "";
    organizationInfoAdresseElement.innerHTML = "";
    organizationInfoActivitePrincipaleElement.innerHTML = "";
    organizationAlertElement.style.display = "none";
    organizationAlertElement.innerHTML = "";
  }

  function showOrganizationInfo() {
    clearOrganizationInfo();

    var rawSiret = siretSelectorElement.value;
    var siretRegex = RegExp(/^(\s*\d){14}$/);
    if (!siretRegex.test(rawSiret)) {
      // if siret is not of a valid format do not make the ajax call
      return null;
    }

    var siret = rawSiret.replace(/\s*/g, "");

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
        if (xmlhttp.status === 200) {
          var response = JSON.parse(xmlhttp.response);
          var libelle = response.organizationInfo.libelle;
          var adresse = response.organizationInfo.adresse;
          var libelleActivitePrincipale = response.organizationInfo.libelleActivitePrincipale;
          var estDiffusible = response.organizationInfo.estDiffusible;
          var estActive = response.organizationInfo.estActive;
          if (!estDiffusible) {
            organizationAlertElement.style.display = "block";
            organizationAlertElement.innerHTML = "Cet établissement est non-diffusible. Merci de le rendre diffusible pour pouvoir vous créer un compte. <a href='https://annuaire-entreprises.data.gouv.fr/etablissement/" + siret + "'>Plus d'info.</a>";
          } else if (estActive) {
            findYourSiretHereElement.style.display = "none";
            organizationInfoElement.style.display = "block";
            organizationInfoLibelleElement.innerHTML = libelle;
            organizationInfoAdresseElement.innerHTML = adresse;
            organizationInfoActivitePrincipaleElement.innerHTML = libelleActivitePrincipale;
          } else {
            organizationAlertElement.style.display = "block";
            organizationAlertElement.innerHTML = "État administratif de l'établissement : fermé";
          }

        } else if (xmlhttp.status === 404) {
          organizationAlertElement.style.display = "block";
          organizationAlertElement.innerHTML = "Nous n'avons pas trouvé votre organisation.";
        } else {
          organizationAlertElement.style.display = "block";
          organizationAlertElement.innerHTML =
            "Erreur inconnue lors de la récupération des informations de cet établissement. " +
            "Merci de réessayer ultérieurement. " +
            "Vous pouvez également nous signaler cette erreur par mail à contact@moncomptepro.beta.gouv.fr.";
        }
      }
    };

    xmlhttp.open("GET", "/api/organization-info?siret=" + siret, true);
    xmlhttp.send();
  }

  clearOrganizationInfo();
  showOrganizationInfo();

  siretSelectorElement.addEventListener("input", showOrganizationInfo, false);
}, false);
