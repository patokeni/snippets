# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as conditions
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.implicitly_wait(10)
driver.get("http://112.111.2.107/eedu_pro_fj/r_login.do")

loginName = (By.ID, 'loginName')

WebDriverWait(driver, 3600, 5).until(conditions.presence_of_element_located(loginName))

driver.find_element(By.ID, 'loginName').send_keys(input("Input account: "))
driver.find_element(By.ID, 'loginPwd').send_keys(input("Input password: "))
driver.find_element(By.ID, 'vCode').send_keys(input("Input verify code: "))
driver.find_element(By.CLASS_NAME, 'log_submit').click()

input("Enter the right page and enter any key...")

iframeStack = ['mainframe', 'mini-iframe-2', 'shsjIframe']
for iframe in iframeStack:
    driver.switch_to.frame(iframe)

input("Enter any key to exit...")
driver.close()
