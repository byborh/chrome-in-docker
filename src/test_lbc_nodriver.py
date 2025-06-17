from nodriver import Browser, Tab
import asyncio

async def test_leboncoin():
    url = "https://www.leboncoin.fr/ad/collection/2409429206"
    
    # Initialisation du navigateur
    browser = await Browser.start()
    tab = await browser.get(url)  # Ouvre un nouvel onglet
    
    try:
        print("🚀 Chargement de la page...")
        
        # Attendre que la page soit chargée (ajustable si nécessaire)
        await asyncio.sleep(3)  
        
        # Sélectionner les éléments (méthode ancienne version)
        title_elem = await tab.select('[data-qa-id="adview_title"] h1')
        price_elem = await tab.select('[data-qa-id="adview_price"] p')
        
        if not title_elem or not price_elem:
            print("⚠️ Éléments non trouvés ou bloqués.")
        else:
            title = await tab.evaluate("(elem) => elem.textContent", title_elem)
            price = await tab.evaluate("(elem) => elem.textContent", price_elem)
            print(f"✅ Titre : {title.strip()}")
            print(f"💰 Prix : {price.strip()}")
    
    except Exception as e:
        print(f"❌ Échec : {e}")
    
    finally:
        await tab.close()  # Fermer l'onglet
        await browser.stop()  # Arrêter le navigateur

asyncio.run(test_leboncoin())
